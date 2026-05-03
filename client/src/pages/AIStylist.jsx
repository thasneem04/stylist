import { useState } from 'react';
import { Upload, Sparkles, Image as ImageIcon } from 'lucide-react';

const AIStylist = () => {
  const [userPhoto, setUserPhoto] = useState(null);
  const [dressPhoto, setDressPhoto] = useState(null);
  const [activeTab, setActiveTab] = useState('style'); // 'style' or 'tryon'
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  // Keep a reference to the raw File objects (not just object URLs)
  const [userFile, setUserFile] = useState(null);
  const [dressFile, setDressFile] = useState(null);
  const [tryOnResult, setTryOnResult] = useState(null);
  const [tryOnError, setTryOnError] = useState(null);

  const resizeImage = (file, maxWidth = 512, maxHeight = 512) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.8);
      };
    });
  };

  const handleUserPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const resized = await resizeImage(file, 768, 768);
      setUserPhoto(URL.createObjectURL(resized));
      setUserFile(resized);
    }
  };

  const handleDressPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const resized = await resizeImage(file, 768, 768);
      setDressPhoto(URL.createObjectURL(resized));
      setDressFile(resized);
    }
  };

  const handleAnalyzeStyle = () => {
    if (!userPhoto) {
      alert("Please upload your photo first!");
      return;
    }
    setAnalyzing(true);
    setAnalysisResult(null);
    setActiveTab('style');

    // Simulated AI analysis (frontend-only, no backend needed)
    setTimeout(() => {
      setAnalysisResult({
        skinTone: "Warm Olive",
        bestColors: ["#000000", "#008000", "#800080", "#ffd700"],
        suggestedOutfits: [
          { name: "Emerald Green Long Gown", match: "98%" },
          { name: "Midnight Elegance Abaya", match: "95%" },
          { name: "Burgundy Velvet Maxi", match: "92%" }
        ]
      });
      setAnalyzing(false);
    }, 2000);
  };

  const handleTryOn = async () => {
    if (!userFile || !dressFile) {
      alert("Please upload both your photo and a dress photo!");
      return;
    }
    setAnalyzing(true);
    setTryOnResult(null);
    setTryOnError(null);
    setActiveTab('tryon');

    try {
      const formData = new FormData();
      formData.append('user_image', userFile);
      formData.append('dress_image', dressFile);

      const res = await fetch('/api/try-on-ai', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Virtual try-on failed. Please try again.');
      }

      setTryOnResult(data.image);
    } catch (err) {
      console.error('[TryOn]', err.message);
      setTryOnError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-10 text-center sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-accent text-sm font-bold mb-4 border border-accent/30 shadow-[0_0_15px_rgba(255,0,127,0.3)]">
          <Sparkles size={16} />
          Modest AI Stylist
        </div>
        <h1 className="mb-4 text-3xl font-black uppercase tracking-tight md:text-5xl">Style & <span className="text-gradient">Virtual Try-On</span></h1>
        <p className="text-gray-400 max-w-2xl mx-auto">Upload your photo to get personalized modest fashion recommendations, or select a dress to see how it looks on you.</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Upload Area */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="glass-card p-5 sm:p-6">
            <h3 className="font-bold uppercase tracking-widest mb-4 text-sm text-gray-300">1. Upload Your Photo</h3>
            {!userPhoto ? (
              <div 
                className="aspect-square flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/20 hover:border-accent/50 transition-colors cursor-pointer rounded-xl bg-black/20"
                onClick={() => document.getElementById('user-upload').click()}
              >
                <input id="user-upload" type="file" accept="image/*" className="hidden" onChange={handleUserPhotoUpload} />
                <Upload size={24} className="text-accent mb-2" />
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Select Image</span>
              </div>
            ) : (
              <div className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={userPhoto} alt="User" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setUserPhoto(null)}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold uppercase"
                >
                  Change Photo
                </button>
              </div>
            )}
          </div>

          <div className="glass-card p-5 sm:p-6">
            <h3 className="font-bold uppercase tracking-widest mb-4 text-sm text-gray-300">2. Upload Dress Photo</h3>
            {!dressPhoto ? (
              <div 
                className="aspect-square flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/20 hover:border-accent/50 transition-colors cursor-pointer rounded-xl bg-black/20"
                onClick={() => document.getElementById('dress-upload').click()}
              >
                <input id="dress-upload" type="file" accept="image/*" className="hidden" onChange={handleDressPhotoUpload} />
                <ImageIcon size={24} className="text-accent mb-2" />
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Select Dress</span>
              </div>
            ) : (
              <div className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={dressPhoto} alt="Dress" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setDressPhoto(null)}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold uppercase"
                >
                  Change Dress
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={handleAnalyzeStyle}
              disabled={!userPhoto || analyzing}
              className={`py-3 rounded-xl font-bold uppercase tracking-wider transition-all ${userPhoto && !analyzing ? 'bg-white/10 hover:bg-white/20 border border-white/20' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
            >
              Analyze My Style
            </button>
            <button 
              onClick={handleTryOn}
              disabled={!userPhoto || !dressPhoto || analyzing}
              className={`py-3 rounded-xl font-bold uppercase tracking-wider transition-all ${userPhoto && dressPhoto && !analyzing ? 'bg-gradient-btn' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
            >
              Virtual Try-On
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="w-full lg:w-2/3">
          <div className="glass-card flex min-h-[520px] flex-col overflow-hidden sm:min-h-[600px]">
            
            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-black/20">
              <button 
                onClick={() => setActiveTab('style')}
                className={`flex-1 px-2 py-4 text-xs font-bold uppercase tracking-widest transition-colors sm:text-sm ${activeTab === 'style' ? 'text-accent border-b-2 border-accent bg-white/5' : 'text-gray-500 hover:text-white'}`}
              >
                Style Analysis
              </button>
              <button 
                onClick={() => setActiveTab('tryon')}
                className={`flex-1 px-2 py-4 text-xs font-bold uppercase tracking-widest transition-colors sm:text-sm ${activeTab === 'tryon' ? 'text-accent border-b-2 border-accent bg-white/5' : 'text-gray-500 hover:text-white'}`}
              >
                Virtual Try-On
              </button>
            </div>

            {/* Content */}
            <div className="relative flex flex-1 flex-col items-center justify-center p-4 sm:p-8">
              {analyzing ? (
                <div className="text-center">
                  <div className="relative w-24 h-24 mb-6 mx-auto">
                    <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto text-accent animate-pulse" size={32} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-widest text-gradient">Processing</h3>
                </div>
              ) : activeTab === 'style' && analysisResult ? (
                <div className="w-full animate-in fade-in slide-in-from-bottom-5">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Skin Tone Profile</h3>
                  <div className="mb-8 flex items-center gap-4 rounded-2xl border border-white/5 bg-black/20 p-4 sm:p-6">
                    <div className="w-16 h-16 rounded-full shadow-[0_0_20px_rgba(255,215,0,0.2)]" style={{ backgroundColor: '#e5c298' }}></div>
                    <div>
                      <h4 className="text-2xl font-black text-white">{analysisResult.skinTone}</h4>
                      <p className="text-sm text-gray-400">Warm undertones detected</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Recommended Modest Colors</h3>
                  <div className="flex gap-4 mb-10">
                    {analysisResult.bestColors.map((color, i) => (
                      <div key={i} className="w-12 h-12 rounded-full shadow-lg border border-white/20" style={{ backgroundColor: color }}></div>
                    ))}
                  </div>

                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Modest Matches</h3>
                  <div className="space-y-4">
                    {analysisResult.suggestedOutfits.map((outfit, i) => (
                      <div key={i} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-bold text-white">{outfit.name}</span>
                        <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">{outfit.match} Match</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === 'tryon' && tryOnResult ? (
                <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in gap-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Try-On Result</h3>
                  <div className="relative max-w-sm w-full bg-black/50 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <img src={tryOnResult} alt="Virtual Try-On Result" className="w-full h-auto" />
                  </div>
                  {tryOnError && (
                    <p className="text-xs text-yellow-400 text-center max-w-sm">{tryOnError}</p>
                  )}
                </div>
              ) : activeTab === 'tryon' && tryOnError ? (
                <div className="text-center space-y-3">
                  <p className="text-red-400 text-sm font-bold">⚠️ Try-On Failed</p>
                  <p className="text-gray-400 text-xs max-w-xs mx-auto">{tryOnError}</p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Upload photos and click an action button to see results.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStylist;
