# puremail
Lightweight library for sending an email using pure Node.js. No packages are required except 'tls' and 'dotenv'.

*Before use, set .env variables*
```
EMAIL=
PASSWORD=
HOST=173.194.222.108
SERVER_NAME=smtp.gmail.com
LOG_ENABLED=false
```

*Example:*
```
import { sendEmail } from "puremail";
...
sendEmail(subject, recipient, html);
```
