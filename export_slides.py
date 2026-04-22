"""Export PPTX slides to PNG images using PowerPoint COM automation."""
import subprocess
import os
import sys

pptx_path = os.path.abspath(r'Accountability_Architecture_Figures.pptx')
output_dir = os.path.abspath(r'slide_images')
os.makedirs(output_dir, exist_ok=True)

# Use PowerPoint COM via a small VBScript
vbs_content = f'''
Set objPPT = CreateObject("PowerPoint.Application")
objPPT.Visible = True

Set objPres = objPPT.Presentations.Open("{pptx_path}")

Dim i
For i = 1 To objPres.Slides.Count
    Dim outputPath
    outputPath = "{output_dir}\\slide_" & i & ".png"
    objPres.Slides(i).Export outputPath, "PNG", 1920, 1440
Next

objPres.Close
objPPT.Quit
WScript.Echo "Done"
'''

vbs_path = os.path.join(output_dir, 'export.vbs')
with open(vbs_path, 'w') as f:
    f.write(vbs_content)

print(f'Running VBScript to export slides...')
result = subprocess.run(['cscript', '//nologo', vbs_path], capture_output=True, text=True, timeout=30)
print(f'stdout: {result.stdout}')
if result.stderr:
    print(f'stderr: {result.stderr}')
print(f'Return code: {result.returncode}')

# Check output
for fname in sorted(os.listdir(output_dir)):
    if fname.endswith('.png'):
        fpath = os.path.join(output_dir, fname)
        print(f'  Exported: {fpath} ({os.path.getsize(fpath)} bytes)')
