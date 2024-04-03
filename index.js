const functions = require('@google-cloud/functions-framework');
const mailgun = require('mailgun-js');
const { Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid');


// Register a CloudEvent callback with the Functions Framework
functions.cloudEvent('sendVerificationEmail', async cloudEvent => {
    // Replace with your actual connection details
    const sequelize = new Sequelize({
        dialect: 'mysql',
        database: process.env.mysql_database,
        username: process.env.mysql_user,
        password: process.env.mysql_password,
        host: process.env.mysql_host,
    });

    try {
        await sequelize.authenticate();
        try {
            await sequelize.sync();
            console.log('syncDatabase: Database synchronized successfully');
        } catch (error) {
            console.error('syncDatabase: Error while synchronizing database', { error });
        }
        console.log('Connection to the database has been established successfully.');
    } catch (error) {
        console.log('Connection to the database has not been established.', error);
    }



    // The Pub/Sub message is passed as the CloudEvent's data payload
    const base64name = cloudEvent.data.message.data;
    const name = base64name ? Buffer.from(base64name, 'base64').toString() : 'World';

    // Access environment variables
    const MAILGUN_DOMAIN = process.env.domain;

    // Initialize Mailgun with your API key and domain
    const mg = mailgun({ apiKey: process.env.apiKey, domain: MAILGUN_DOMAIN });

    const data = JSON.parse(name); // Assuming data is JSON encoded
    console.log('data', data)

    // Generate a verification token (consider using a secure library)
    const verificationToken = Buffer.from(JSON.stringify(data)).toString('base64');

    // Construct the verification link (replace with your actual domain)
    const verificationLink = `https://manashree.me:443/v1/user/verify-email?token=${verificationToken}`;


    // Email options
    const mailOptions = {
        from: `postmaster@${MAILGUN_DOMAIN}`,
        to: data.username,
        subject: 'Verify Your Email Address',
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
            <h1>Hi ${data.first_name},</h1>
            <p>Thank you for signing up with our service. To get started, please verify your email address by clicking the link below:</p>
            <p><a href="${verificationLink}">Verify Email Address</a></p>
            <p>If you didn't sign up for our service, please ignore this email.</p>
            <p>Thanks,<br>Manashree</p>
        </body>
        </html>`
    };


    try {
        // Send the email
        await mg.messages().send(mailOptions);

        // Save verification data to the database
        const insertQuery = `
INSERT INTO TrackEmail (id, email, verificationToken, verificationLink, is_verified, created_at)
VALUES (:id, :email, :verificationToken, :verificationLink, :is_verified, NOW())`;

        const [insertedRows] = await sequelize.query(insertQuery, {
            replacements: {
                id: uuidv4(), // Generate a UUID for the id field
                email: data.username,
                verificationToken: verificationToken,
                verificationLink: verificationLink,
                is_verified: false
            }
        });


        console.log('Verification email sent and data saved successfully.');
    } catch (error) {
        console.error('Error sending email or saving data:', error);
    }
});
