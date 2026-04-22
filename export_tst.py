"""Export TST diagram slide to PNG via PowerPoint COM."""
import subprocess, os

pptx_path = os.path.abspath(r'TST_Diagram_Publication.pptx')
output_dir = os.path.abspath(r'slide_images')
os.makedirs(output_dir, exist_ok=True)

vbs_content = '''
Set objPPT = CreateObject("PowerPoint.Application")
objPPT.Visible = True
Set objPres = objPPT.Presentations.Open("{pptx}")
Dim outputPath
outputPath = "{out}\\tst_table.png"
objPres.Slides(1).Export outputPath, "PNG", 1920, 1080
objPres.Close
objPPT.Quit
WScript.Echo "Done"
'''.format(pptx=pptx_path, out=output_dir)

vbs_path = os.path.join(output_dir, 'export_tst.vbs')
with open(vbs_path, 'w') as f:
    f.write(vbs_content)

result = subprocess.run(['cscript', '//nologo', vbs_path], capture_output=True, text=True, timeout=30)
print(f'stdout: {result.stdout}')
if result.stderr:
    print(f'stderr: {result.stderr}')
fpath = os.path.join(output_dir, 'tst_table.png')
if os.path.exists(fpath):
    print(f'Exported: {fpath} ({os.path.getsize(fpath)} bytes)')
else:
    print('Export failed - file not found')
