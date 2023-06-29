import tls from 'tls';
import os from 'os';
import 'dotenv/config';


let tlsOptions = {
    allowInternalNetworkInterfaces: false,
    host: process.env.HOST,
    port: 465,
    servername: process.env.SERVER_NAME
}

function generateAuthToken(user, pass) {
    return Buffer.from('\u0000' + user + '\u0000' + pass, 'utf-8').toString('base64');
}

let resolver;

function onData(chunk) {
    if (process.env.LOG_ENABLED) {
        let data = (chunk || '').toString('binary');
        let lines = data.split(/\r?\n/);

        console.log('data');
        console.log(lines);
    }
    return resolver ? resolver() : Promise.resolve();
}

function writeCommand(socket, command) {
    socket.write(Buffer.from(command, 'utf-8'));
    const globalPromise = new Promise((resolve, reject) => {
        resolver = resolve;
    });
    return globalPromise;
}

function subscribeEvents(socket) {
    socket.on('data', (chunk) => {
        onData(chunk);
    });
    socket.on('close', (arg) => {
        console.log(arg);
    });
    socket.on('end', () => {});
    socket.on('timeout', (arg, arg1) => {
        console.log('timeout', arg, arg1);
    });
    socket.on('error', (arg1, arg2) => {
        console.log('error', arg1, arg2);
    });
}

export async function sendEmail(subject, recipient, html) {
    try {
        const socket = tls.connect(tlsOptions, async () => {
            socket.setKeepAlive(true);
            const authToken = generateAuthToken(process.env.EMAIL, process.env.PASSWORD);

            await writeCommand(socket, `EHLO ${os.hostname()}\r\n`);
            await writeCommand(socket, `AUTH PLAIN ${authToken}\r\n`);
            await writeCommand(socket, `MAIL FROM:<${process.env.EMAIL}>\r\n`);
            await writeCommand(socket, `RCPT TO:<${recipient}>\r\n`);
            await writeCommand(socket, 'DATA\r\n');
            await writeCommand(socket, `TO: ${recipient}\r\nSUBJECT: ${subject}\r\n${html}`);
            await writeCommand(socket, '\r\n.\r\n');
            await writeCommand(socket, 'QUIT');
        });

        subscribeEvents(socket);
    } catch (error) {
        console.log(error);
    }
}
