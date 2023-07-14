const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer');
const schedule = require('node-schedule');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
app.get('/', (req, res) => {
  res.send('Telegram Bot is running!');
});


app.listen(process.env.PORT || 3000, () => {
  console.log('Server is running...');
});


mongoose.connect('mongodb+srv://ankush282000:ankush28@amazontracker.rlsrhbf.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));


const productSchema = new mongoose.Schema({
  link: String,
  chatId: Number,
  latestPrice: Number
});

const Product = mongoose.model('Product', productSchema);
const bot = new TelegramBot('6303398462:AAG0BmzoFpuIiUa7tDKpTxO9rM85NIB4qhI', { polling: true });

bot.onText(/\/track (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const productLinks = match[1].split(',');

  try {
    const validLinks = [];
    const invalidLinks = [];

    for (const productLink of productLinks) {
      // Validate the link format
      const linkRegex = /^(https?:\/\/)?([\w\d-]+\.){1,}[\w-]+(\/[\w\d.-]*)*(\/)?$/;
      if (linkRegex.test(productLink.trim())) {
        validLinks.push(productLink.trim());
      } else {
        invalidLinks.push(productLink.trim());
      }
    }

    // Add valid links to the database
    for (const validLink of validLinks) {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(validLink.trim());

      const price = await page.$eval('#corePriceDisplay_desktop_feature_div .a-price-whole', (element) => element.innerText.trim());

      const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
      const product = new Product({
        link: validLink,
        chatId: chatId,
        latestPrice: numericPrice
      });

      await product.save();
      await browser.close();
    }

    let message = '';
    if (validLinks.length > 0) {
      message += 'Products added for tracking:\n';
      for (let i = 0; i < validLinks.length; i++) {
        message += `${i + 1}. ${validLinks[i]}\n`;
      }
    }
    if (invalidLinks.length > 0) {
      message += '\nInvalid links:\n';
      for (let i = 0; i < invalidLinks.length; i++) {
        message += `${i + 1}. ${invalidLinks[i]}\n`;
      }
    }

    bot.sendMessage(chatId, message.trim());
  } catch (error) {
    console.error('An error occurred while saving the products:', error);
  }
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const message = `Welcome to the Amazon Price Tracker Bot!\n\nThis bot allows you to track the prices of Amazon products. Here are the available commands:\n\n` +
    `/track <product_link> - Add a product link to track the price\n` +
    `/list - List all the products you are tracking\n` +
    `/start - Show available commands\n` +
    `/contact - Get in touch with us`;

  bot.sendMessage(chatId, message);
});

bot.onText(/\/contact/, (msg) => {
  const chatId = msg.chat.id;

  const message = `You can connect with us on social media:\n\n` +
    `Instagram: https://www.instagram.com/_ankussh/\n` +
    `Linkedin: https://www.linkedin.com/in/ankush-choudhary28/`;

  bot.sendMessage(chatId, message);
});

bot.onText(/\/list/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const products = await Product.find({ chatId }).exec();
    if (products.length === 0) {
      bot.sendMessage(chatId, 'You are not tracking any products.');
    } else {
      let message = 'Your tracked products:\n';
      products.forEach((product, index) => {
        message += `${index + 1}. ${product.link}\n`;
      });
      bot.sendMessage(chatId, message);
    }
  } catch (error) {
    console.error('An error occurred while fetching the products:', error);
  }
});


schedule.scheduleJob('0 * * * *', async () => {
  try {
    const products = await Product.find().exec();

    for (const product of products) {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(product.link);
      const title = await page.$eval('#productTitle', (element) => element.innerText.trim());
      const price = await page.$eval('#corePriceDisplay_desktop_feature_div .a-price-whole', (element) => element.innerText.trim());

      const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
      if (numericPrice < product.latestPrice) {
        const message = `🚨 Price Alert! 🚨\n\nProduct: ${title}\nPrevious Price: Rs.${product.latestPrice}\nCurrent Price: Rs.${numericPrice}\nLink: ${product.link}`;
        bot.sendMessage(product.chatId, message);
      }
      product.latestPrice = numericPrice;

      await product.save();
      await browser.close();
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
});

module.exports = app;