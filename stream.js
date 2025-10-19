// এই কোড Vercel-এর সার্ভারে চলবে

// 1. লকার থেকে গোপন ঠিকানাটি নিন
const M3U8_URL = process.env.SECRET_M3U8_URL;

// যখন আপনার ওয়েবসাইট পোস্টম্যানকে ডাকবে
module.exports = async (req, res) => {
  // নিশ্চিত করুন যে ঠিকানাটি সেট করা আছে
  if (!M3U8_URL) {
    res.status(500).send('Video address is missing.');
    return;
  }

  try {
    // 2. পোস্টম্যান গোপনে আসল ঠিকানায় গিয়ে ভিডিওর ডেটা নিয়ে আসে
    const response = await fetch(M3U8_URL);

    if (!response.ok) {
      res.status(response.status).send('Could not fetch video data.');
      return;
    }

    // 3. এটি একটি M3U8 ফাইল - ব্রাউজারকে জানিয়ে দিন
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*'); 

    // 4. সংগৃহীত ভিডিও ডেটা আপনার ওয়েবসাইটকে ফেরত পাঠান
    response.body.pipe(res);

  } catch (error) {
    res.status(500).send('Internal Server Error during fetching.');
  }
};
