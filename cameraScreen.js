const scripts = document.getElementsByTagName("script")
const video = document.getElementById('video')
const registerBtn = document.getElementById("registerBtn")
const name = document.getElementById("name")
const login = document.getElementById("loginBtn")
var methodType = "register"


var found = false
var snapshots = [];

registerBtn.addEventListener('click', function(){

    methodType = "register"
    found = false

    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.faceExpressionNet.loadFromUri('./models')
      ]).then(startVideo)
      
})

login.addEventListener('click', function(){

    methodType = "login"
    found = false

    alert("test Login")
    
    Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
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


video.addEventListener('play', async () => {


    let faceDiv = document.getElementById("faceDiv")

    const canvas = faceapi.createCanvasFromMedia(video)
    faceDiv.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)

    if(methodType == "register"){

        var interval = setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            faceapi.draw.drawDetections(canvas, resizedDetections)
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
            let score = (detections[0]["alignedRect"]["_score"])
            
            if(score > 0.82 && !found){

                console.log(score)

                document.getElementById('output');
                var canvasHelper = capture(video, 1);



                snapshots.unshift(canvasHelper);
                output.innerHTML = '';
                output.appendChild(snapshots[0]);


                found = true

                snapshots[0].toBlob((blob) => {
                    const timestamp = Date.now().toString();
                    const a = document.createElement('a');
                    // document.body.append(a);
                    a.download = `${name.value}.png`;
                    a.href = URL.createObjectURL(blob);
                    a.click();
                    a.remove();
                });

                setTimeout(function(){
                    clearInterval(interval)
                    video.remove()
                    canvas.remove()
                }, 4000)


            }else{
  
                console.log("not clear")
            }

    }, 100)

    }else if(methodType == "login"){
        const labelsWithImage = await loadMyPhoto()
        const faceMatcher = new faceapi.FaceMatcher(labelsWithImage, .7)
        var interval = setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
            const resizedDetections = faceapi.resizeResults(detections, displaySize)
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
            faceapi.draw.drawDetections(canvas, resizedDetections)
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
            let score = (detections[0]["alignedRect"]["_score"])
            
            if(score > 0.82 && !found){
               
                console.log(score)

                document.getElementById('output');
                var canvasHelper = capture(video, 1);



                snapshots.unshift(canvasHelper);
                output.innerHTML = '';
                // output.appendChild(snapshots[0]);
                var data = dataURItoBlob(snapshots[0].toDataURL('image/jpeg'));

                found = true


                setTimeout(function(){
                    clearInterval(interval)
                    console.log( document.getElementById('output'))
                    document.getElementById('output').remove()
                    video.remove()
                    canvas.remove()
                }, 4000)

                
                let currentImg = await faceapi.bufferToImage(data, new faceapi.SsdMobilenetv1Options())
                const detection =  await faceapi.detectSingleFace(currentImg).withFaceLandmarks().withFaceDescriptor()
                const results = faceMatcher.findBestMatch(detection.descriptor)

                if(results.length != "undefined"){
                    alert("hello Talal Badreddine")
                }else{
                    alert("You are not Talal")
                }
                
                return


 
            }else{
  
                console.log("not clear")
            }

    }, 100)

    }
    
    
})



function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);
  
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
  
    // create a view into the buffer
    var ia = new Uint8Array(ab);
  
    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
  
    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], {type: mimeString});
    return blob;
  
  }


  function loadMyPhoto(){
    const labels = ['Talal Badreddine']

    return Promise.all(
        labels.map(async label => {
          const descriptions = []
            const img = await faceapi.fetchImage(`https://github.com/TalalBadreddine/faceDetection/blob/master/facesImages/Talal%20Badreddine.png?raw=true`)
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
            descriptions.push(detections.descriptor)
    
          return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
      )


    // let myImg =  faceapi.fetchImage(`https://github.com/TalalBadreddine/faceDetection/tree/master/facesImages/TalalBadreddine.png`)
    // const detection =  faceapi.detectSingleFace(myImg).withFaceLandmarks().withFaceDescriptor()
    // return new faceapi.LabeledFaceDescriptor("Talal badreddine", detection)

}