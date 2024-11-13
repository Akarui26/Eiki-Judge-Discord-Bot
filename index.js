const express = require("express");
const {
  Client,
  GatewayIntentBits,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const app = express();

app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(3000, () => {
  console.log("Project is running !");
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log("Bot is online!");
});

// Objek untuk menyimpan userName berdasarkan userId
const userNames = {};

client.on(Events.MessageCreate, async (message) => {
  // Cek apakah pesan berasal dari Dyno Bot
  if (
    message.author.id === "1302532721570087024" &&
    message.channel.name === "verification-answer" &&
    message.embeds.length > 0
  ) {
    // Log isi pesan ke konsol
    console.log(`Pesan dari Dyno Bot diterima`);
    const embed = message.embeds[0];

    console.log(`Embed diterima: ${JSON.stringify(embed, null, 2)}`);

    // Ambil User ID dari pesan
    const userIdMatch = embed.footer.text.match(/User ID:\s*(\d+)/);
    if (userIdMatch) {
      const userId = userIdMatch[1];
      console.log(`User ID yang diambil: ${userId}`);

      try {
        // Ambil user object untuk mendapatkan username
        const user = await client.users.fetch(userId);
        const userName = user.username;
        userNames[userId] = userName;

        console.log(`Username yang diambil: ${userName}`);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("accept")
            .setLabel("Terima")
            .setStyle("Success"),
          new ButtonBuilder()
            .setCustomId("reject")
            .setLabel("Tolak")
            .setStyle("Danger"),
        );

        await message.channel.send({
          content: `${userName}, Terima atau Tolak?`,
          components: [row],
        });
        console.log("Pesan dengan tombol telah dikirim.");
      } catch (error) {
        console.error(`Gagal mengambil user dengan ID ${userId}:`, error);
      }
    } else {
      console.log("User ID tidak ditemukan dalam pesan.");
    }
  }
});

// Mengatur interaksi tombol
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  console.log(
    `Tombol diklik oleh pengguna: ${interaction.user.tag} (ID: ${interaction.user.id})`,
  );

  // Dapatkan userId dari embed atau simpanan sebelumnya.
  const userId = "userId dari sumber embed atau simpanan";
  const userName = userNames[userId];

  if (!userName) {
    console.error("Username tidak ditemukan untuk userId:", userId);
    return interaction.reply({
      content: "Gagal mendapatkan username.",
      ephemeral: true,
    });
  }

  console.log(`Interaksi melibatkan username: ${userName}`);

  // Dapatkan anggota dari guild
  const member = await interaction.guild.members.fetch(userId);

  if (interaction.customId === "accept") {
    decision = true;

    // Mengirim pesan pribadi ke pengguna menggunakan userName dari embed
    await member.send(
      `Selamat!!!, anda diterima di komunitas **Old Adam Bar** semoga betahh... salam HANIWAAA`,
    );

    // Memberikan peran "Bar Customer"
    const role = interaction.guild.roles.cache.find(
      (role) => role.name === "Bar Customer",
    );
    if (role) {
      await member.roles.add(role);
      console.log(
        `Peran "Bar Customer" telah diberikan kepada pengguna ID: ${userId}`,
      );
    } else {
      console.log(`Peran "Bar Customer" tidak ditemukan.`);
    }

    await interaction.reply(`Anda telah menerima ${userName} untuk bergabung.`);
    console.log(`Keputusan: Terima untuk pengguna ID: ${interaction.user.id}`);
  } else if (interaction.customId === "reject") {
    decision = false;

    // Mengirim pesan pribadi ke pengguna menggunakan userName dari embed
    await member.send(
      `Maafff sepertinya kami belum bisa mengajak anda masuk komunitas **Old Adam Bar**. Tapi cobalah untuk kembali setelah lebih banyak tau tentang Touhou Project OKEYYYY`,
    );

    await interaction.reply(`Anda telah menolak ${userName} untuk bergabung.`);
    console.log(`Keputusan: Tolak untuk pengguna ID: ${interaction.user.id}`);
  }

  console.log(
    `Proses keputusan selesai untuk pengguna ID: ${interaction.user.id}`,
  );
});

client.login(process.env.token);
