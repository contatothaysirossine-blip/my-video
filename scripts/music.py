# Minimal ambient piano + warm pad, synthesised (royalty-free by construction).
import numpy as np, wave, sys, json
SR=44100; DUR=float(sys.argv[2]); N=int(SR*DUR)
VARIANT=int(sys.argv[3]) if len(sys.argv)>3 else 1
rng=np.random.default_rng(7*VARIANT)
out=np.zeros((N,2))
def note(f, start, length, amp, pan):
    n=int(length*SR); t=np.arange(n)/SR
    env=np.exp(-t*1.6)*(1-np.exp(-t*60))           # soft hammer attack, long decay
    sig=sum(a*np.sin(2*np.pi*f*h*t + h) for h,a in [(1,1),(2,.35),(3,.12),(4,.05)])
    sig*=env*amp
    s=int(start*SR)
    if s>=N: return
    e=min(N,s+n); sig=sig[:e-s]
    out[s:e,0]+=sig*(1-pan); out[s:e,1]+=sig*pan
def pad(freqs,start,length,amp):
    n=int(length*SR); t=np.arange(n)/SR
    env=np.sin(np.pi*np.clip(t/length,0,1))**2
    sig=sum(np.sin(2*np.pi*f*t)+np.sin(2*np.pi*f*1.003*t+1) for f in freqs)*env*amp
    s=int(start*SR)
    if s>=N: return
    e=min(N,s+n); out[s:e,0]+=sig[:e-s]; out[s:e,1]+=sig[:e-s]
m=lambda k: 440*2**((k-69)/12)
# One calm, unresolved progression per reel
PROGS={
 1:[[53,57,60,64],[57,60,64,67],[50,57,60,65],[46,53,57,62]],  # Fmaj7 Am7 Dm7 Bbmaj7
 2:[[50,54,57,61],[47,54,57,62],[43,50,54,59],[45,52,54,57]],  # Dmaj7 Bm7 Gmaj7 A6sus
 3:[[51,55,58,62],[48,55,58,63],[44,51,55,60],[46,53,55,58]],  # Ebmaj7 Cm7 Abmaj7 Bb6
 4:[[48,52,55,59],[52,55,59,62],[45,52,55,60],[41,48,52,57]],  # Cmaj7 Em7 Am7 Fmaj7
 5:[[55,59,62,66],[52,55,59,62],[48,55,59,64],[50,57,59,62]],  # Gmaj7 Em7 Cmaj7 D6
}
prog=PROGS[VARIANT]
bar={1:4.8,2:5.2,3:5.0,4:4.6,5:5.6}[VARIANT]; t0=0.0; i=0
while t0<DUR:
    ch=prog[i%4]
    pad([m(k-12) for k in ch[:2]], t0, bar*1.3, 0.010)
    note(m(ch[0]-12), t0, 5, 0.05, 0.45)
    arp=[ch[1],ch[2],ch[3],ch[2]+12 if i%2 else ch[3]+5]
    for j,k in enumerate(arp):
        note(m(k), t0+0.3+j*bar/4.5+rng.uniform(-0.03,0.03), 4, 0.032*rng.uniform(.8,1), 0.3+0.4*rng.random())
    if i%2==1: note(m(ch[3]+12), t0+bar*0.8, 3.5, 0.016, 0.65)
    t0+=bar; i+=1
# lush reverb: convolve with decaying stereo noise
ir_n=int(3.2*SR); tt=np.arange(ir_n)/SR
for c in range(2):
    ir=rng.standard_normal(ir_n)*np.exp(-tt*2.2); ir[0]=3
    L=N+ir_n; F=1<<int(np.ceil(np.log2(L)))
    out[:,c]=np.fft.irfft(np.fft.rfft(out[:,c],F)*np.fft.rfft(ir,F),F)[:N]
# gentle low-pass (one-pole) to keep it soft and far
fr=np.fft.rfftfreq(N,1/SR)
for c in range(2):
    out[:,c]=np.fft.irfft(np.fft.rfft(out[:,c])/np.sqrt(1+(fr/2500)**2),N)
fade=np.ones(N); fi=int(2*SR); fo=int(3*SR)
fade[:fi]=np.linspace(0,1,fi); fade[-fo:]=np.linspace(1,0,fo)
out*=fade[:,None]; out/=np.abs(out).max()*1.05
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
