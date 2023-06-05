const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const operandClient = require("@operandinc/sdk").operandClient;
const indexIDHeaderKey = require("@operandinc/sdk").indexIDHeaderKey;
const ObjectService = require("@operandinc/sdk").ObjectService;

// Open AI Configuration
const configuration = new Configuration({
  organization: "org-MgzdcfxN4df81USJrxl9cH4M",
  apiKey: "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",
});

const openai = new OpenAIApi(configuration);

// Express Configuration
const app = express();
const port = 3080;

app.use(bodyParser.json());
app.use(cors());
app.use(require("morgan")("dev"));

// Routing

// Primary Open AI Route
app.post("/", async (req, res) => {
  const { message } = req.body;

  const runIndex = async () => {
    const operand = operandClient(
      ObjectService,
      process.env.OPERAND_KEY,
      "https://api.operand.ai",
      {
        [indexIDHeaderKey]: process.env.OPERAND_INDEX_KEY,
      }
    );

    try {
      const results = await operand.searchWithin({
        query: `${message}`,
        limit: 5,
      });

      if (results) {
        return results.matches.map((m) => `- ${m.content}`).join("\n");
      } else {
        return "";
      }
    } catch (error) {
      console.log(error);
    }
  };

  let operandSearch = await runIndex(message);


  // const basePromptPrefix = `This is a conversation between the Simiao Zhao and Simiao Zhao himself.\nRelevant information that Simiao Zhao knows:\nSimiao Zhao is starting the startup with 泊泰 和 子菡, the startup name is metamirror';
  const basePromptPrefix = `This is a conversation between the Simiao Zhao and Simiao Zhao himself.\nRelevant information that Simiao Zhao knows:\nSimiao Zhao is starting the startup with 泊泰 和 子菡, the startup name is metamirror`;


  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${basePromptPrefix}\n\nStranger:${message}\n\nSiraj:`,
    max_tokens: 256,
    temperature: 0.7,
  });
  res.json({
    message: response.data.choices[0].text,
  });
});

// Get Models Route

// Start the server
app.listen(port, () => {
  console.log(`server running`);
});

module.exports = app;
