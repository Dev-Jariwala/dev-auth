import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient } from '../../config/aws.js';

// Send email function
export const sendEmail = async (from, to, subject, bodyHtml, bodyText) => {
    try {
        const params = {
            Destination: {
                ToAddresses: [to]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: bodyHtml
                    },
                    Text: {
                        Charset: 'UTF-8',
                        Data: bodyText
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject
                }
            },
            Source: from
        };

        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log('Email sent', response);
        return response;
    } catch (error) {
        console.error('Error sending email', error);
        throw error;
    }
};