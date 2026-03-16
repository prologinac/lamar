const { handleAntiBadwordCommand } = require('../lib/antibadword');
const isAdminHelper = require('../lib/isAdmin');

module.exports = async (sock, chatId, message, args, context) => {
    const { isSudo } = context;
    const sender = message.key.participant || message.key.remoteJid;
    
    // Check Admin
    const check = await isAdminHelper(sock, chatId, sender);
    if (!check.isSenderAdmin && !isSudo) {
        return await sock.sendMessage(chatId, { text: '
http://googleusercontent.com/immersive_entry_chip/0

---

### 📦 Next Steps:
1.  **Save these** as `.js` files in your `commands/` folder.
2.  **Delete** the old `aiCommand`, `aliveCommand`, etc., from your `main.js` (because the new `main.js` will now find these files automatically).
3.  **Test them!** **Would you like me to convert the next 5 commands for you?** Just paste them whenever you're ready.
