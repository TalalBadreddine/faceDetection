const scripts = document.getElementsByTagName("script")
const video = document.getElementById('video')
const registerBtn = document.getElementById("registerBtn")
const name = document.getElementById("name")

var found = false
var snapshots = [];

registerBtn.addEventListener('click', function(){

    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.faceExpressionNet.loadFromUri('./models')
      ]).then(startVideo)
      
})

  

function startVideo(){
    navigator.mediaDevices.getUserMedia(

        { 

        video:{width: 720, height: 560},
        audio:false 

         }).then((stream) =>{
            video.srcObject = stream
         })


}



const folderName = '/Users/joe/test';

function capture(video, scaleFactor) {
    if (scaleFactor == null) {
        scaleFactor = 1;
    }
    var w = video.videoWidth * scaleFactor;
    var h = video.videoHeight * scaleFactor;
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    return canvas;
}


video.addEventListener('play', () => {
    let faceDiv = document.getElementById("faceDiv")

    const canvas = faceapi.createCanvasFromMedia(video)
    faceDiv.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    var interval = setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            faceapi.draw.drawDetections(canvas, resizedDetections)
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
            let score = (detections[0]["alignedRect"]["_score"])
            
            if(score > 0.98 && !found){

                console.log(score)

                document.getElementById('output');
                var canvasHelper = capture(video, 1);
                // canvas.onclick = function() {
                //     window.open(this.toDataURL(image/jpg));
                // };


                snapshots.unshift(canvasHelper);
                output.innerHTML = '';
                output.appendChild(snapshots[0]);
                // var data = snapshots[0].toDataURL('image/png');
                // window.open(data);

                found = true

                snapshots[0].toBlob((blob) => {
                    const timestamp = Date.now().toString();
                    const a = document.createElement('a');
                    document.body.append(a);
                    a.download = `${name.value}.png`;
                    a.href = URL.createObjectURL(blob);
                    a.click();
                    a.remove();
                    alert("done")
                });

                setTimeout(function(){
                    clearInterval(interval)
                    video.remove()
                    canvas.remove()
                    // canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
                }, 4000)


            }else{
  
                console.log("not clear")
            }

    }, 100)
})

