# Very soft, muffled air whoosh: band-limited noise with a swelling envelope.
import numpy as np, wave, sys
SR=44100; d=0.9; n=int(SR*d); t=np.arange(n)/SR
rng=np.random.default_rng(3); x=rng.standard_normal(n)
env=np.sin(np.pi*(t/d)**0.7)**3
F=np.fft.rfft(x); f=np.fft.rfftfreq(n,1/SR)
F*=np.exp(-((f-550)/450)**2)       # muffled: energy around 300–900 Hz
y=np.fft.irfft(F,n)*env; y/=np.abs(y).max()
st=np.stack([y*np.linspace(.8,.4,n), y*np.linspace(.4,.8,n)],1)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st*0.9*32767).astype(np.int16).tobytes()); w.close()
