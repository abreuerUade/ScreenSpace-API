const nodemailer = require('nodemailer');
// const nodemailerSendgrid = require('nodemailer-sendgrid');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
    constructor(user, url) {
        this.to = user.email;
        this.url = url;
        this.from = `Screen Space <${process.env.EMAIL_FROM}>`;
    }

    // newTransport() {
    //     return nodemailer.createTransport(
    //         nodemailerSendgrid({
    //             apiKey: process.env.SENDGRID_PASSWORD,
    //         })
    //     );
    // }
    newTransport() {
        return nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD,
            },
        });
    }

    // Send mail
    async send(template, subject) {
        const html = pug.renderFile(
            `${__dirname}/../views/emails/${template}.pug`,
            {
                url: this.url,
                subject,
            }
        );

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.toString(html),
        };

        // 3- Send the mail

        await this.newTransport().sendMail(mailOptions);
    }

    async sendVerifyEmail() {
        await this.send(
            'verifyEmail',
            'Confirm your registation to Screen Space'
        );
    }

    async sendResetPassword() {
        await this.send('resetPassword', 'Password reset');
    }
}

module.exports = Email;
