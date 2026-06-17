import net from "node:net";
import tls from "node:tls";

function readLine(socket) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const onData = (chunk) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1];
      if (last && /^\d{3} /.test(last)) {
        socket.off("data", onData);
        socket.off("error", reject);
        resolve(buffer);
      }
    };
    socket.on("data", onData);
    socket.once("error", reject);
  });
}

async function command(socket, value, expected = /^[23]/) {
  socket.write(`${value}\r\n`);
  const response = await readLine(socket);
  if (!expected.test(response)) {
    throw new Error(`SMTP command failed: ${value}`);
  }
  return response;
}

function encodeAddress(name, email) {
  return name ? `"${String(name).replace(/"/g, "'")}" <${email}>` : email;
}

function sanitizeHeader(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

export async function sendMail({ to, replyTo, subject, text }) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.MAIL_FROM || user;
  const fromName = process.env.MAIL_FROM_NAME || "Valade et associés";

  if (!host || !user || !pass || !from) {
    throw new Error("SMTP is not configured.");
  }

  const secure = port === 465 || process.env.SMTP_SECURE === "true";
  let socket = secure
    ? tls.connect({ host, port, servername: host })
    : net.connect({ host, port });

  await readLine(socket);
  await command(socket, `EHLO ${process.env.SMTP_HELO || "huissiersvalade.com"}`);

  if (!secure) {
    await command(socket, "STARTTLS");
    socket = tls.connect({ socket, servername: host });
    await command(socket, `EHLO ${process.env.SMTP_HELO || "huissiersvalade.com"}`);
  }

  await command(socket, "AUTH LOGIN", /^334/);
  await command(socket, Buffer.from(user).toString("base64"), /^334/);
  await command(socket, Buffer.from(pass).toString("base64"), /^235/);
  await command(socket, `MAIL FROM:<${from}>`);
  await command(socket, `RCPT TO:<${to}>`);
  await command(socket, "DATA", /^354/);

  const message = [
    `From: ${encodeAddress(fromName, from)}`,
    `To: ${to}`,
    replyTo ? `Reply-To: ${sanitizeHeader(replyTo)}` : "",
    `Subject: ${sanitizeHeader(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text
  ].filter(Boolean).join("\r\n");

  socket.write(`${message}\r\n.\r\n`);
  await readLine(socket);
  await command(socket, "QUIT").catch(() => undefined);
  socket.end();
}
