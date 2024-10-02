import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import './Home.css'

const BotAvatar = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef(null);

  // Function to preprocess the image
  const preprocessImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Convert to grayscale
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i += 4) {
          const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
          imageData.data[i] = avg; // Red
          imageData.data[i + 1] = avg; // Green
          imageData.data[i + 2] = avg; // Blue
        }
        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob(resolve); // Get the blob of the processed image
      };
    });
  };

  const handleBotClick = () => {
    document.getElementById('fileInput').click();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Preprocess the image before extracting text
      const processedBlob = await preprocessImage(file);
      setSelectedImage(URL.createObjectURL(processedBlob));
      setLoading(true);

      // Use Tesseract.js to recognize text from the processed image
      Tesseract.recognize(processedBlob, 'eng', {
        logger: (m) => console.log(m),
      })
        .then(({ data: { text } }) => {
          setExtractedText(text);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error recognizing text:', error);
          setLoading(false);
        });
    }
  };

  const handleReadAloud = (language) => {
    if ('speechSynthesis' in window) {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }

      const speech = new SpeechSynthesisUtterance(extractedText);
      speech.lang = language;
      setIsSpeaking(true);

      speech.onend = () => {
        setIsSpeaking(false);
        speechRef.current = null;
      };

      speechRef.current = speech;
      window.speechSynthesis.speak(speech);
    } else {
      alert('Sorry, your browser does not support text-to-speech.');
    }
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
    }
  };

  const handleResume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
    }
  };

  return (
    <div className='web-site h-screens'>
      <div>
        <div className='h-14'>
          <h1 className='p-4 ml-20 font-bold text-2xl text-white '>Bot Speak</h1>
        </div>
        <div className="flex justify-center gap-28 items-center h-screen border-t-2">
          <div className=' w-4/12'>
            <h1 className='text-white font-bold text-5xl'> Upload Image to </h1>
            <h1 className='text-white font-bold text-5xl'> Extract Text </h1>
            <h1 className='text-white font-bold text-5xl'> Free </h1>
            <h1 className='text-white font-bold text-5xl'> Tested Version </h1>
          </div>
          <div className="text-center w-4/12">
            <div className='flex justify-center'>
              <img
                alt=""
                className="bot-logo cursor-pointer w-40 h-40 rounded-full border-4 border-blue-950"
                onClick={handleBotClick}
              />
            </div>
            <p className="text-lg text-blue-950 bg-white rounded-3xl p-2 mt-10">Click on me to Upload Image</p>

            {/* Hidden file input */}
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Show the selected image */}
            {selectedImage && (
              <div className="mt-4 flex justify-center items-center gap-10">
                <img
                  src={selectedImage}
                  alt="Uploaded"
                  className="w-60 h-auto border-2 border-gray-300"
                />
                {loading ? (
                  <p className="mt-2 text-white text-lg font-semibold">Processing image...</p>
                ) : (
                  <p className="mt-2 text-white text-lg font-semibold">Text extracted successfully!</p>
                )}
              </div>
            )}
          </div>

          {/* Show extracted text */}

        </div>

      </div>
      <div className='flex justify-center'>
        {extractedText && (
          <div className="mt-0 mb-10 p-4 w-10/12 bg-white shadow rounded">
            <h3 className="text-lg font-bold">Extracted Text:</h3>
            <p className="text-gray-700 mt-2">{extractedText}</p>

            {/* Read Aloud Button in English */}
            <button
              onClick={() => handleReadAloud('en-US')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
            >
              Read Aloud (English)
            </button>

            {/* Read Aloud Button in Hindi */}
            <button
              onClick={() => handleReadAloud('hi-IN')}
              className="mt-4 ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
            >
              Read Aloud (Hindi)
            </button>

            {/* Pause Button */}
            <button
              onClick={handlePause}
              className="mt-4 ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
              disabled={!isSpeaking}
            >
              Pause
            </button>

            {/* Resume Button */}
            <button
              onClick={handleResume}
              className="mt-4 ml-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none"
              disabled={!window.speechSynthesis.paused}
            >
              Resume
            </button>
          </div>
        )}
      </div>

    </div>

  );
};

export default BotAvatar;
