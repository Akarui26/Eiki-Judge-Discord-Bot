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

// Gantilah userNames menjadi messages yang menyimpan 3 data
let messages = {};

// Ketika pesan dikirim, simpan data di messages
client.on(Events.MessageCreate, async (message) => {
  if (
    message.author.id === "1302532721570087024" &&
    message.channel.name === "verification-answer" &&
    message.embeds.length > 0
  ) {
    const embed = message.embeds[0];

    // Ambil FirstUserId dari embed footer
    const FirstUserId = embed.footer.text.match(/User ID:\s*(\d+)/)?.[1];
    if (FirstUserId) {
      try {
        // Ambil user object untuk mendapatkan username
        const user = await client.users.fetch(FirstUserId);
        const FirstUserName = user.username;

        // Simpan data dalam messages dengan message.id sebagai kunci
        const sentMessage = await message.channel.send({
          content: `${FirstUserName} dengan id: ${FirstUserId}, Terima atau Tolak?`,
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("accept")
                .setLabel("Terima")
                .setStyle("Success"),
              new ButtonBuilder()
                .setCustomId("reject")
                .setLabel("Tolak")
                .setStyle("Danger")
            ),
          ],
        });

        // Simpan data di messages dengan key berdasarkan message.id
        messages[sentMessage.id] = {
          messageId: sentMessage.id,
          userId: FirstUserId,
          userName: FirstUserName,
        };

        console.log(`Pesan dengan ID ${sentMessage.id} telah dikirim.`);
      } catch (error) {
        console.error(`Gagal mengambil user dengan ID ${FirstUserId}:`, error);
      }
    }
  }
});

// Tangani interaksi tombol
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  // Ambil data dari messages berdasarkan message.id interaksi
  const messageData = messages[interaction.message.id];

  if (!messageData) {
    console.error("Data pesan tidak ditemukan.");
    return interaction.reply({
      content: "Gagal mendapatkan data pesan.",
      ephemeral: true,
    });
  }

  const { userId, userName } = messageData;

  console.log(`Interaksi dengan pengguna: ${userName} dengan ID: ${userId}`);

  const member = await interaction.guild.members.fetch(userId);

  // Ambil action dari customId tombol
  const action = interaction.customId;

  if (action === "accept") {
    await member.send(
      `Selamat!!!, anda diterima di komunitas **Old Adam Bar** semoga betahh... salam HANIWAAA`
    );

    const role = interaction.guild.roles.cache.find(
      (role) => role.name === "Bar Customer"
    );
    if (role) {
      await member.roles.add(role);
      console.log(
        `Peran "Bar Customer" telah diberikan kepada pengguna ID: ${userId}`
      );
    } else {
      console.log(`Peran "Bar Customer" tidak ditemukan.`);
    }

    await interaction.reply(`Anda telah menerima ${userName} untuk bergabung.`);
    console.log(`Keputusan: Terima untuk pengguna ID: ${userId}`);
  } else if (action === "reject") {
    await member.send(
      `Maafff sepertinya kami belum bisa mengajak anda masuk komunitas **Old Adam Bar**. Tapi cobalah untuk kembali setelah lebih banyak tau tentang Touhou Project OKEYYYY`
    );

    await interaction.reply(`Anda telah menolak ${userName} untuk bergabung.`);
    console.log(`Keputusan: Tolak untuk pengguna ID: ${userId}`);
  }

  console.log(`Proses keputusan selesai untuk pengguna ID: ${userId}`);

  setTimeout(async () => {
    // Kirim pesan bahwa verifikasi tidak valid lagi
    try {
      const channel = await client.channels.fetch(interaction.channelId); // Ambil channel dari interaksi
      if (channel) {
        await channel.send(
          `Verifikasi untuk user ${userName} dengan ID ${userId} sudah tidak valid lagi.`
        );
        console.log(
          `Pesan "verifikasi tidak valid lagi" telah dikirim untuk ID: ${userId}.`
        );
      } else {
        console.log(
          `Channel untuk interaksi tidak ditemukan. Pesan tidak dapat dikirim untuk ID: ${userId}.`
        );
      }
    } catch (error) {
      console.error(
        `Gagal mengirim pesan "verifikasi tidak valid lagi" untuk ID: ${userId}:`,
        error
      );
    }

    // Hapus data pengguna dari messages
    delete messages[interaction.message.id];
    console.log(
      `Data untuk pengguna ID: ${userId} telah dihapus setelah 1 detik.`
    );
  }, 1000); // 1000 ms = 1 detik
});

client.login(process.env.token);
