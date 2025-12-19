import express from "express";
import "dotenv/config"
import { db } from "./config/db.js";
import { favoritesTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";
const app = express()
const PORT = process.env.PORT || 5001

app.use(express.json())
app.get("/api/health", (req, res) => {
    res.send({
        status: 200,
        success: true,
        message: "first api"
    })
})

app.post("/api/favorites", async (req, res) => {
    try {
        const { userId, recipeId, title, image, cookTime, servings } = req.body
        if (!userId || !recipeId || !title) {
            res.send({
                status: 400,
                success: false,
                message: "Missing required Fields"
            })
        }
        const newFavorite = await db
            .insert(favoritesTable)
            .values({
                userId,
                recipeId,
                title,
                image,
                cookTime,
                servings,
            })
            .returning();
        res.status(201).json(newFavorite[0]);
    }

    catch (error) {
        console.log("Error adding favorite", error);
        res.send({
            status:500,
            success:false,
            message:"Something went wrong",
            error:error
        })
    }
})

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    await db
      .delete(favoritesTable)
      .where(
        and(eq(favoritesTable.userId, userId), eq(favoritesTable.recipeId, parseInt(recipeId)))
      );

    res.status(200).json({ message: "Favourite removed successfully" });
  } catch (error) {
    console.log("Error removing a favorite", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/favorites/:userId",async (req,res)=>{
    try {
    const { userId } = req.params;

    const userFavorites = await db
      .select()
      .from(favoritesTable)
      .where(eq(favoritesTable.userId, userId));

    res.status(200).json(userFavorites);
  } catch (error) {
    console.log("Error fetching the favorites", error);
    res.status(500).json({ error: "Something went wrong" });
  }
})

app.listen(PORT, (err) => {
    if (!err) {
        console.log("Server is connected on port", PORT);
    }
    else {
        console.log("Server is not connected");
    }
})