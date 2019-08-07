var seeds = new Array();
var seedbed = null;
var seedframe = 0;
var seedimg = null;
var seedhs = { maxscore: 0 };
var HEIGHT = 250
var imgWidth = 30;
var imgHeight = 30;

function preventSelect() {
    return false;
}

function newseed(x, y) {

    function choose(items) { return items[Math.floor(Math.random() * items.length)] }
    var imageChoices = ['./assets/images/peony.png', './assets/images/peony1.png', './assets/images/peony3.png']
    if (seedbed == null) {
        seedbed = document.getElementById('seedbed');
        if (seedbed == null)
            return;
        seedimg = document.createElement('IMG');
        var seedUrl = choose(imageChoices)
        if (navigator.appName == 'Microsoft Internet Explorer') { // use ie filter
            seedimg = document.createElement('DIV');
            // The initial position and width get overriden quite quickly
            seedimg.style.cssText = "position:absolute;left:-40px;top:30px;width:30px;height:40px;";
            seedimg.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale', src='" + seedUrl + "')";
        }
        else {
            seedimg.src = seedUrl;
            seedimg.style.cssText = "position:absolute;left:-40px;top:30px;width:30px;height:40px;user-select:none;-o-user-select:none;-moz-user-select:none;-khtml-user-select:none;-webkit-user-select:none;";
        }
    }
    var seed = seedimg.cloneNode(true);
    seed.onselectstart = preventSelect;
    seed.onselect = preventSelect;
    seed.ondblclick = preventSelect;
    seed.onmousedown = preventSelect;
    seed.ondragstart = preventSelect;
    seed.scale = 0.5 + Math.random() * 0.5; // size of face/pic
    // move image by half of image width and height so middle image is where click is
    seed.xloc = x - imgWidth / 2 * seed.scale;
    seed.yloc = y - imgHeight / 2 * seed.scale;
    seed.xvel = 1;
    seed.yvel = 0;
    seed.xwind = 3 * Math.random();
    seed.ywind = Math.random(); // - 0.5;
    seed.style.width = Math.round(imgWidth * seed.scale) + 'px';
    seed.style.height = Math.round(imgHeight * seed.scale) + 'px';
    seeds[seeds.length] = seed;
    seed.src = choose(imageChoices)
    seedbed.appendChild(seed);
    return false;
}

/** Produces a random number between the inclusive lower and upper bounds */
function random(a, b) {
    // lowest number is a, plus difference between number b and a
    return a + Math.random() * (b - a)
}

function blowseeds() {
    var cbLogo = document.querySelector('.navbar-brand img');
    var logoDimensions = cbLogo.getBoundingClientRect();
    // peonies generated inside the height of the logo
    var verticalStart = random(40, 100);
    // if theres lesss than 30 theres an x chance of creating new ones
    if (seeds.length < 30 && Math.random() < 0.02 || seeds.length == 0)
        newseed(100, verticalStart);

    for (var i = seeds.length - 1; i >= 0; --i) {
        var seed = seeds[i];
        var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        seed.xloc += (0.5 + seed.xvel) * 0.6;
        seed.yloc += (seed.yvel) * 0.5;
        seed.style.transform = 'rotate(' + seed.xloc * 5 + 'deg)';
        seed.xvel += seed.xwind * 0.1;
        seed.yvel += seed.ywind * 0.1;

        // drag/friction
        seed.xvel *= 0.99;
        seed.yvel *= 0.99;
        seed.xwind *= 0.9;
        seed.ywind *= 0.9;

        // 1% of time we set the wind to strong again
        if (Math.random() < 0.01) {
            seed.xwind = 3 * Math.random();
            seed.ywind = Math.random() * plusOrMinus;
            // // If the middle of the seed if greater than the height make it drift down instead
            // if (seed.yloc > HEIGHT - seed.scale * imgHeight / 2)
            //     seed.ywind = -seed.ywind //* Math.random();
        };

        seed.style.left = Math.round(seed.xloc) + 'px';
        seed.style.top = Math.round(seed.yloc) + 'px';

        // removes seeds out of bounds
        // TODO wat?
        var maxx = seedbed.getBoundingClientRect().width + imgWidth / 2;
        if (seed.xloc > maxx || seed.xloc < -imgWidth || seed.yloc < -imgHeight || seed.yloc > HEIGHT) {
            seedbed.removeChild(seed);
            seeds.splice(i, 1); // remove element i
        }
    }
    setTimeout("blowseeds()", 40)
}



function seedblower(e) {
    var posx = 0;
    var posy = 0;
    if (!e) var e = window.event;
    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    }
    // else if (e.clientX || e.clientY) {
    //     posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    //     posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    // }

    for (var i = 0; i < seeds.length; ++i) {
        var seed = seeds[i];
        var dx = (seed.xloc + 15 * seed.scale) - posx;
        var dy = (seed.yloc + 20 * seed.scale) - posy;
        var mag = Math.sqrt(dx * dx + dy * dy);
        if (mag > 0 && mag < 50) {
            seed.xwind = 0.2 * (50 - mag) * dx / mag;
            seed.ywind = 0.2 * (50 - mag) * dy / mag;
        }
    }
}

function seedgrower(e) {
    // get mouse position
    var posx = 0;
    var posy = 0;
    if (!e) var e = window.event;
    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    }
    // else if (e.clientX || e.clientY) {
    //     posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    //     posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    // }
    // the seeds are position:absolute which relative to parent. If we want a parent that doesn't start at (0,0)...
    // 1. get position of parent
    var element = document.getElementById('seedbed');
    var rect = element.getBoundingClientRect();
    // 2. modify the click position
    posx -= rect.left;
    posy -= rect.top;

    newseed(posx, posy);
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
    return false;
}

function getPageMaxScroll() {
    // Cross browser page height detection is ugly
    return Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
    ) - window.innerHeight; // Subtract viewport height
}


function resizeSeedbox() {
    // so run this on window resize and onload
    // TODO maybe

    var windowTop = 1000000; // Value larger than maximum scroll
    var maxScroll = getPageMaxScroll();

    // Fix for bug on iOS devices
    // When top was larger than maximum page scroll
    // "getBoundingClientRect" would take that value into calculations
    if (windowTop > maxScroll) {
        windowTop = maxScroll;
    }

    // Scroll the window to the new position
    window.scrollTo(0, windowTop);

    var element = document.querySelector('.container')
    var rect = element.getBoundingClientRect();
    var seedbed = document.getElementById('seedbed')
    var borderWidth = 10
    var top = rect.top;
    var left = rect.left;
    var width = rect.width;

    var bodyRect = document.body.getBoundingClientRect(),
        elemRect = element.getBoundingClientRect(),
        offset = elemRect.top - bodyRect.top;

    console.log('Element is ' + offset + ' vertical pixels from <body>');
    console.log("rect.top: ", top)
    console.log("offset: ", offset);


    seedbed.style["top"] = (top + offset) + borderWidth / 2 + 'px'; // 10 is rect.top
    seedbed.style["left"] = left + borderWidth / 2 + 'px' // 105.5 is rect.left
    seedbed.style["width"] = width - borderWidth + 'px' // 1140 is rect.width
    // console.log('resizeSeedbox')
    // seedbed.style["height"] = rect.height + 'px'
}
window.onresize = resizeSeedbox()
// window.onload = resizeSeedbox
