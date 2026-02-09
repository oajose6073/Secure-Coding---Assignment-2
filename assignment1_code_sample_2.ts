import * as readline from 'readline';
import * as mysql from 'mysql';
import { exec } from 'child_process';
import * as http from 'http';
import { dbConfigs } from './secrets/secret';
import * as log from 'loglevel';
import nodemailer from 'nodemailer';

const dbConfig = {
    host: dbConfigs.host,
    user: dbConfigs.user,
    password: dbConfigs.password,
    database: dbConfigs.database
};

function getUserInput(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('Enter your name: ', (answer) => {
            if (answer.length > 20) {
                log.warn('Input is too long, truncating to 50 characters.');
                answer = answer.substring(0, 50);
            }
            rl.close();
            resolve(answer);
        });
    });
}

function sendEmail(to: string, subject: string, body: string) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
            user: dbConfigs.emailUser,
            pass: dbConfigs.emailPassword
        }
    });
    transporter.sendMail({
        from: dbConfigs.emailUser,
        to: to,
        subject: subject,
        text: body
    }, (error, info) => {
        if (error) {
            log.error(`Error sending email: ${error}`);
        }
    });
}

function getData(): Promise<string> {
    return new Promise((resolve, reject) => {
        http.get('http://insecure-api.com/get-data', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function saveToDb(data: string) {
    const connection = mysql.createConnection(dbConfig);
    const query = `INSERT INTO mytable (column1, column2) VALUES ('${data}', 'Another Value')`;

    connection.connect();
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
        } else {
            console.log('Data saved');
        }
        connection.end();
    });
}

(async () => {
    const userInput = await getUserInput();
    const data = await getData();
    saveToDb(data);
    sendEmail('admin@example.com', 'User Input', userInput);
})();