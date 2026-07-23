require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Song = require("../models/Song");

const songs = [

/* SAD */

{ title:"Fix You", artist:"Coldplay", genre:"Alternative", mood:"sad", audioUrl:"/songs/sad/sad1.mp3" },
{ title:"Someone Like You", artist:"Adele", genre:"Pop", mood:"sad", audioUrl:"/songs/sad/sad2.mp3" },
{ title:"Bruises", artist:"Lewis Capaldi", genre:"Pop", mood:"sad", audioUrl:"/songs/sad/sad3.mp3" },
{ title:"Too Good At Goodbyes", artist:"Charlie Puth", genre:"Pop", mood:"sad", audioUrl:"/songs/sad/sad4.mp3" },
{ title:"Agar Tum Saath Ho", artist:"Arijit Singh", genre:"Bollywood", mood:"sad", audioUrl:"/songs/sad/sad5.mp3" },

/* HAPPY */

{ title:"Sunshine Road", artist:"Neon Skies", genre:"Pop", mood:"happy", audioUrl:"/songs/happy/happy1.mp3" },
{ title:"Golden Days", artist:"City Waves", genre:"Pop", mood:"happy", audioUrl:"/songs/happy/happy2.mp3" },
{ title:"Bright Horizon", artist:"Aurora Beats", genre:"Pop", mood:"happy", audioUrl:"/songs/happy/happy3.mp3" },
{ title:"Dancing Light", artist:"Skyline", genre:"Pop", mood:"happy", audioUrl:"/songs/happy/happy4.mp3" },
{ title:"Summer Pulse", artist:"Nova Tunes", genre:"Pop", mood:"happy", audioUrl:"/songs/happy/happy5.mp3" },

/* ANGRY */

{ title:"Numb", artist:"Linkin Park", genre:"Rock", mood:"angry", audioUrl:"/songs/angry/angry1.mp3" },
{ title:"Killing In The Name", artist:"Rage Against The Machine", genre:"Rock", mood:"angry", audioUrl:"/songs/angry/angry2.mp3" },
{ title:"Monster", artist:"Skillet", genre:"Rock", mood:"angry", audioUrl:"/songs/angry/angry3.mp3" },
{ title:"Breaking Fire", artist:"Iron Pulse", genre:"Rock", mood:"angry", audioUrl:"/songs/angry/angry4.mp3" },
{ title:"Storm Rage", artist:"Dark Voltage", genre:"Rock", mood:"angry", audioUrl:"/songs/angry/angry5.mp3" },

/* CALM */

{ title:"Photograph", artist:"Ed Sheeran", genre:"Acoustic", mood:"calm", audioUrl:"/songs/calm/calm1.mp3" },
{ title:"Yellow", artist:"Coldplay", genre:"Alternative", mood:"calm", audioUrl:"/songs/calm/calm2.mp3" },
{ title:"Silent Sky", artist:"Aurora Waves", genre:"Ambient", mood:"calm", audioUrl:"/songs/calm/calm3.mp3" },
{ title:"Soft Horizons", artist:"Ocean Drift", genre:"Ambient", mood:"calm", audioUrl:"/songs/calm/calm4.mp3" },
{ title:"Quiet Lights", artist:"Blue Meadow", genre:"Ambient", mood:"calm", audioUrl:"/songs/calm/calm5.mp3" },

/* ENERGETIC */

{ title:"Believer", artist:"Imagine Dragons", genre:"Rock", mood:"energetic", audioUrl:"/songs/energetic/energetic1.mp3" },
{ title:"Wake Me Up", artist:"Avicii", genre:"EDM", mood:"energetic", audioUrl:"/songs/energetic/energetic2.mp3" },
{ title:"Pulse Runner", artist:"Neon Drive", genre:"EDM", mood:"energetic", audioUrl:"/songs/energetic/energetic3.mp3" },
{ title:"Electric Rise", artist:"Sky Voltage", genre:"EDM", mood:"energetic", audioUrl:"/songs/energetic/energetic4.mp3" },
{ title:"Speed Of Sound", artist:"Nova Beats", genre:"EDM", mood:"energetic", audioUrl:"/songs/energetic/energetic5.mp3" },

/* NEUTRAL */

{ title:"Midnight Walk", artist:"Grey Horizon", genre:"LoFi", mood:"neutral", audioUrl:"/songs/neutral/neutral1.mp3" },
{ title:"Soft Echo", artist:"Calm Static", genre:"LoFi", mood:"neutral", audioUrl:"/songs/neutral/neutral2.mp3" },
{ title:"Urban Silence", artist:"Quiet City", genre:"LoFi", mood:"neutral", audioUrl:"/songs/neutral/neutral3.mp3" },
{ title:"Still Motion", artist:"Low Tide", genre:"LoFi", mood:"neutral", audioUrl:"/songs/neutral/neutral4.mp3" },
{ title:"Late Night Loop", artist:"Neon Rain", genre:"LoFi", mood:"neutral", audioUrl:"/songs/neutral/neutral5.mp3" },

];

const seedSongs = async () => {
    try {
        await connectDB();

        await Song.deleteMany();
        await Song.insertMany(songs);

        console.log("Songs seeded successfully");
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedSongs();