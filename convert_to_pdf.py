import os
import sys

def convert_to_pdf(input_file, output_file):
    try:
        import comtypes.client
        powerpoint = comtypes.client.CreateObject("Powerpoint.Application")
        powerpoint.Visible = 1
        
        # Open the presentation
        deck = powerpoint.Presentations.Open(input_file)
        
        # Save as PDF (Format type 32 is PDF)
        deck.SaveAs(output_file, 32)
        deck.Close()
        powerpoint.Quit()
        print(f"Successfully created PDF: {output_file}")
    except Exception as e:
        print(f"Failed to convert using comtypes: {e}")

if __name__ == "__main__":
    input_path = r"C:\Users\HARDIK\Downloads\HR_Automation_Final_Presentation.pptx"
    output_path = r"C:\Users\HARDIK\Downloads\HR_Automation_Final_Presentation.pdf"
    
    if os.path.exists(input_path):
        convert_to_pdf(input_path, output_path)
    else:
        print(f"Error: {input_path} does not exist.")
