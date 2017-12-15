let sampleImage = new Image()
let sampleCanvas = document.createElement('canvas')
let sampleContext = sampleCanvas.getContext('2d')

let sampleLine = {
	start:{
		x:0, y:0
	},
	end:{
		x:0, y:0
	}
}

function clickToImageCoord(e,img){
	let r = img.getClientRects()[0]
	let x = ((e.clientX - r.left) / r.width) * img.naturalWidth
	let y = ((e.clientY - r.top) / r.height) * img.naturalHeight
	x = Math.floor(x)
	y = Math.floor(y)
	return { x,y }
}

function imageCoordToDocCoord(x,y,img){
	let r = img.getClientRects()[0]
	x = ((x / img.naturalWidth) * r.width) + r.left + window.scrollX
	y = ((y / img.naturalHeight) * r.height) + r.top + window.scrollY
	return { x,y }
}

let isDown = false

sampleImage.addEventListener('mousedown',function(e){
	sampleLine.start = clickToImageCoord(e,sampleImage)
	isDown = true
})
sampleImage.addEventListener('mousemove',function(e){
	if(isDown){
		setEndAndSample(e)
	}
})
sampleImage.addEventListener('mouseup',function(e){
	setEndAndSample(e)
	isDown = false
})

function setEndAndSample(e){
	sampleLine.end = clickToImageCoord(e,sampleImage)
	let dist = Math.sqrt(Math.pow(sampleLine.start.x - sampleLine.end.x,2) + Math.pow(sampleLine.start.y - sampleLine.end.y,2))
	let sampleSize = Math.ceil((dist/sampleImage.naturalWidth) * sampleImage.clientWidth / 75)
	doSample(sampleSize)
}


sampleImage.addEventListener('load',function(e){
	sampleCanvas.width = sampleImage.naturalWidth
	sampleCanvas.height = sampleImage.naturalHeight
	sampleContext.drawImage(sampleImage,0,0,sampleImage.naturalWidth,sampleImage.naturalHeight)
	dragPrompt.innerText = "Now draw a line on the image to sample colors."
})

sampleImage.addEventListener('drop',function(e){
	clearUI()
	if(e.dataTransfer && e.dataTransfer.files[0]){
		let reader = new FileReader,
			file = e.dataTransfer.files[0],
			medium = file.type.split('/')[0];
				
		reader.onload = function(event) {
			sampleImage.src = event.target.result;
		};

		if (medium === 'image') {
			reader.readAsDataURL(file);
		}

		e.preventDefault();
		e.stopPropagation();
		return false
	}
})
sampleImage.addEventListener('dragover',function(e){
	e.preventDefault();
})
sampleImage.id = "sample"
sampleImage.setAttribute('draggable',false)
document.body.appendChild(sampleImage)

function lerp(ratio, start, end){
    return start + (end - start) * ratio;
}

function pick(x,y) {
	let pixel = sampleContext.getImageData(x, y, 1, 1);
	let data = pixel.data;
	return `#${toHex(data[0])}${toHex(data[1])}${toHex(data[2])}`
	function toHex(num){
		return num.toString(16).padStart(2,'0')
	}
}

function doSample(numSamples){
	clearUI()
	if(numSamples != 0){
		for(let i = 0; i < numSamples + 1; i++){
			let sampleX = lerp(i/numSamples, sampleLine.start.x, sampleLine.end.x)
			let sampleY = lerp(i/numSamples, sampleLine.start.y, sampleLine.end.y)
			let markerPos = imageCoordToDocCoord(sampleX,sampleY,sampleImage)
			let color = pick(sampleX, sampleY)
			placeMarker(markerPos.x,markerPos.y,color)
			
		}
	} else {

		let markerPos = imageCoordToDocCoord(sampleLine.start.x,sampleLine.start.y,sampleImage)
		let color = pick(sampleLine.start.x, sampleLine.start.y)
		placeMarker(markerPos.x,markerPos.y,color)
	}
}

function placeMarker(x,y,color){
	var marker = document.createElement('div')
	marker.classList.add('marker')
	marker.style.left = `${x - 5}px`
	marker.style.top = `${y - 15}px`
	marker.style.background = color
	sampleLocations.appendChild(marker)

	var swatch = document.createElement('div')
	swatch.classList.add('swatch')
	swatch.style.background = color
	swatch.innerText = color
	swatches.appendChild(swatch)
}

function clearUI(){
	sampleLocations.innerHTML = ""
	swatches.innerHTML = ""
}