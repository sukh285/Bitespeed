import { app } from "./app";
import { env } from "./config/env";

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

// Auto ping to keep site awake for render downtime (ONLY IN PRODUCTION)
if (env.NODE_ENV === "production") {
  const url = `${env.BACKEND_URL}/api/v1/health`;
  const interval = 5000;

  function reloadWebsite() {
    fetch(url)
      .then(() => {
        console.log("Website load");
      })
      .catch((err) => {
        console.error(`Error: ${err.message}`);
      });
  }

  setInterval(reloadWebsite, interval);
}
