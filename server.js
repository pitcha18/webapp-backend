import "dotenv/config";
import express from "express";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());
app.use(cors());

const DRONE_URL = process.env.DRONE_URL;
const DRONE_LOG = process.env.DRONE_LOG;
const API_TOKEN = process.env.API_TOKEN;

app.get("/configs/:id", async (req, res) => {
  try {
    const droneID = Number(req.params.id);
    console.log(droneID);
    const response = await fetch(DRONE_URL);
    if (!response.ok) {
      throw new Error("something error");
    }
    const data = await response.json();
    const drone = data.data.find((d) => Number(d.drone_id) === droneID);
    if (!drone) {
      throw new Error("Drone not found");
    }
    const filteredDrone = {
      drone_id: drone.drone_id,
      drone_name: drone.drone_name,
      light: drone.light,
      country: drone.country,
      weight: drone.weight,
    };

    console.log(filteredDrone);
    res.json(filteredDrone);
  } catch (error) {
    console.log("error", error);
  }
});

app.get("/status/:id", async (req, res) => {
  try {
    const droneID = Number(req.params.id);
    console.log(droneID);

    const response = await fetch(DRONE_URL);
    if (!response.ok) {
      throw new Error("something error");
    }
    const data = await response.json();
    const drone = data.data.find((d) => Number(d.drone_id) === droneID);
    if (!drone) {
      throw new Error("Drone not found");
    }
    const filteredDrone = {
      condition: drone.condition,
    };

    console.log(filteredDrone);
    res.json(filteredDrone);
  } catch (error) {
    console.log("error", error);
  }
});

app.get("/logs/:id", async (req, res) => {
  try {
    const droneID = Number(req.params.id);
    console.log(droneID);

    const page = req.query.page || 1;
    const perPage = req.query.perPage || 12;

    const response = await fetch(
      `${DRONE_LOG}?page=${page}&perPage=${perPage}&sort=-created&filter=(drone_id=${droneID})`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("something error");
    }

    const data = await response.json();
    const drone = data.items.map((d) => ({
      drone_id: d.drone_id,
      drone_name: d.drone_name,
      created: d.created,
      country: d.country,
      celsius: d.celsius,
    }));
    if (!drone) {
      throw new Error("Drone not found");
    }
    console.log(drone);
    res.json(drone);
  } catch (error) {
    console.log("error", error);
  }
});

app.post("/logs", async (req, res) => {
  try {
    const { drone_id, drone_name, country, celsius } = req.body;

    if (!drone_id || !drone_name || !country || celsius === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newLog = { drone_id, drone_name, country, celsius };

    const response = await fetch(DRONE_LOG, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(newLog),
    });

    if (!response.ok) {
      throw new Error("Failed to create new log");
    }

    const result = await response.json();

    res.status(201).json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
