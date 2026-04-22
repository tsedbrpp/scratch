
Set objPPT = CreateObject("PowerPoint.Application")
objPPT.Visible = True
Set objPres = objPPT.Presentations.Open("C:\Users\mount\.gemini\antigravity\scratch\TST_Diagram_Publication.pptx")
Dim outputPath
outputPath = "C:\Users\mount\.gemini\antigravity\scratch\slide_images\tst_table.png"
objPres.Slides(1).Export outputPath, "PNG", 1920, 1080
objPres.Close
objPPT.Quit
WScript.Echo "Done"
