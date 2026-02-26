module.exports = async (sock, chatId, message, args) => {
  if (args.length < 2) {
    return sock.sendMessage(
      chatId,
      { text: '❌ Usage: .schedule <time><s|m|h> <message>' },
      { quoted: message }
    );
  }

  const timeArg = args[0];
  const text = args.slice(1).join(' ');

  const value = parseInt(timeArg);
  const unit = timeArg.slice(-1);

  if (isNaN(value)) {
    return sock.sendMessage(
      chatId,
      { text: '❌ Invalid time format.' },
      { quoted: message }
    );
  }

  let delay;
  if (unit === 's') delay = value * 1000;
  else if (unit === 'm') delay = value * 60 * 1000;
  else if (unit === 'h') delay = value * 60 * 60 * 1000;
  else {
    return sock.sendMessage(
      chatId,
      { text: '❌ Use s, m, or h (example: 10m)' },
      { quoted: message }
    );
  }

  await sock.sendMessage(
    chatId,
    { text: `⏳ Message scheduled in ${value}${unit}` },
    { quoted: message }
  );

  setTimeout(async () => {
    await sock.sendMessage(chatId, { text: `⏰ Scheduled Message:\n${text}` });
  }, delay);
};