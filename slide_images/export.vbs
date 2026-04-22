
Set objPPT = CreateObject("PowerPoint.Application")
objPPT.Visible = True

Set objPres = objPPT.Presentations.Open("C:\Users\mount\.gemini\antigravity\scratch\Accountability_Architecture_Figures.pptx")

Dim i
For i = 1 To objPres.Slides.Count
    Dim outputPath
    outputPath = "C:\Users\mount\.gemini\antigravity\scratch\slide_images\slide_" & i & ".png"
    objPres.Slides(i).Export outputPath, "PNG", 1920, 1440
Next

objPres.Close
objPPT.Quit
WScript.Echo "Done"
