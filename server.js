const http = require("http");
const { PORT } = require("./config");

const app = require("./app");
const server = http.createServer(app);

server.listen(PORT, () => console.log(`listening on port ${PORT}`));
