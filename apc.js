const { Client, NoAuth } = require("whatsapp-web.js");
const axios = require("axios");
const qrcode = require("qrcode-terminal");

const client = new Client({ authStrategy: new NoAuth() });

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("message_create", (message) => {
  const command = message.body.split(" ");

  console.log("Command Received:", command);
  const errorMessage = `El comando funciona de esta manera tienes que enviar "/price *itemNivel* *Item* ejemplo: /price t5 bolsa 3"`;

  if (command[0] === "/price") {
    if (command.length <= 2) {
      message.reply(errorMessage);
    } else {
      const item = command.slice(1).join("_");
      console.log("Item:", item);

      async function getPrices(item) {
        const url = `https://west.albion-online-data.com/api/v2/stats/prices/${item}.json?locations=Caerleon,Bridgewatch,Lymhurst,Fort Sterling,Martlock,Brecilien,Thetford`;
        console.log("API URL:", url);
        try {
          const response = await axios.get(url);
          console.log("Fetched Data:", response.data); // Debug log
          return response.data;
        } catch (error) {
          console.error("Error fetching data:", error);
          throw error;
        }
      }

      getPrices(item)
        .then((prices) => {
          if (!prices || prices.length === 0) {
            message.reply(`No se encontraron precios para el item: ${item}.`);
            return;
          }

          const uniquePrices = prices.reduce((acc, entry) => {
            if (!acc.some((e) => e.city === entry.city)) {
              acc.push(entry);
            }
            return acc;
          }, []);

          const priceInfo = uniquePrices
            .filter((entry) => entry.sell_price_min > 0)
            .map(
              (entry) =>
                `Ciudad: *${entry.city}*: \n Precio de venta mínimo: *${entry.sell_price_min}*`
            )
            .join("\n");

          message.reply(`Precios para ${item}:\n${priceInfo}`);
        })
        .catch((error) => {
          console.error("Error during API call:", error);
          message.reply(
            "Hubo un error al obtener los precios. Inténtalo más tarde."
          );
        });
    }
  }
});

client.initialize();
