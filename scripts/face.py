import cv2,json,sys,numpy as np
cap=cv2.VideoCapture(sys.argv[1]); fps=30
casc=cv2.CascadeClassifier(cv2.data.haarcascades+"haarcascade_frontalface_default.xml")
xs=[];ys=[];i=0;last=(560,170)
while True:
    ok,fr=cap.read()
    if not ok: break
    if i%3==0:
        g=cv2.cvtColor(fr,cv2.COLOR_BGR2GRAY)
        fs=casc.detectMultiScale(g,1.1,6,minSize=(60,60))
        if len(fs):
            x,y,w,h=max(fs,key=lambda r:r[2]*r[3]); last=(x+w/2,y+h/2)
    xs.append(last[0]);ys.append(last[1]);i+=1
# smooth with a wide moving average for an elegant, calm camera
def sm(a,k=45):
    a=np.array(a); p=np.pad(a,(k,k),mode='edge'); return np.convolve(p,np.ones(2*k+1)/(2*k+1),'valid')
X=sm(xs);Y=sm(ys)
json.dump({"fps":fps,"x":[round(v,1) for v in X],"y":[round(v,1) for v in Y]},open(sys.argv[2],"w"))
print(len(X),X.min(),X.max(),Y.min(),Y.max())
