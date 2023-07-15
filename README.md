# Amazon Price Tracker Telegram Bot

The Amazon Price Tracker Telegram Bot is a Telegram bot that allows you to track the prices of Amazon products. You can add product links to track, and the bot will send you an alert whenever the price drops below a certain threshold. 
## Username (@AmazonTrackerBot)

## Features

- Add multiple product links to track.
- Receive price drop alerts via Telegram.
- View the list of tracked products.
- Supports hourly price checks.

## Bot Commands

- `/track <product_link>` - Add a product link to track. Multiple links can be separated by commas.
- `/list` - View the list of tracked products.

## Deployment

The Amazon Price Tracker bot can be deployed on Render, a cloud platform for hosting and scaling web applications.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

To deploy the bot on Render, click the "Deploy to Render" button above or follow these steps:

1. Sign up or log in to your Render account (https://render.com).
2. Create a new Render project.
3. Connect your GitHub repository to the Render project.
4. Configure the deployment settings:
   - Set the environment variables for `TELEGRAM_BOT_TOKEN`, `MONGODB_URI`, and `PORT`.
   - Specify the build command as `npm install --production`.
   - Set the start command as `npm start`.
   - Make sure the port number matches the value specified in the `.env` file.
5. Start the deployment process and wait for the build to complete.
6. Once the deployment is successful, you can access your Amazon Price Tracker bot on Render.

## Environment Variables

Make sure to set the following environment variables:

- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token.
- `MONGODB_URI`: Your MongoDB URI.
- `PORT`: The port number on which the bot will listen.
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD`: true
- `PUPPETEER_EXECUTABLE_PATH`: /usr/bin/google-chrome-stable

## Technologies Used

- Node.js
- Telegram Bot API
- Puppeteer
- Node Schedule
- MongoDB
- Express

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, feel free to open an issue or submit a pull request.
