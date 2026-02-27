async function Dictate(){
    var baseText=document.getElementById("textContent").value
    //console.log(baseText)
    var wordList=baseText.split(" ")
    var tokenList=[] //The Voice has some fixed delay between utterances, trying to merge words
    var utterenceList=[]
    var delay=60000/document.getElementById("targetWPM").value
    var timea=0
    var timeb=0
    var timeStart=Date.now()
    var n=-1
    var wordsPerToken=2

    delay*=wordsPerToken

    for(let i=0;i<wordList.length;i++){
        if(i%wordsPerToken==0){
            n++
            tokenList[n]=wordList[i]
        }else{
            tokenList[n]+=(" "+wordList[i])
        }
    }

    for(let i=0;i<tokenList.length;i++){
        utterenceList[i]=new SpeechSynthesisUtterance(tokenList[i])
    }
    if(delay<1000){
        utterenceList.forEach(element => {
            element.rate=2
        });
    }
    console.log("list "+tokenList)
    console.log("delay"+delay)
    for(let i=0;i<utterenceList.length;i++){
        
        speechSynthesis.speak(utterenceList[i])
        timeb=Date.now()//tracks time for each loop
        console.log(timeb-timea)
        timea=timeb
        await sleep(delay)
    }
    while(speechSynthesis.speaking){
        await sleep(100)
    }
    timeb=Date.now()-timea //becomes time since loop ended
    timea=Date.now()-timeStart //becomes total time
    console.log("spillover")
    console.log(timeb)
    console.log("total time")
    console.log(timea)
    console.log("target time")
    console.log(delay*utterenceList.length)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}