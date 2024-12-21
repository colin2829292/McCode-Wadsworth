# -----------------------------------------------------------

import os
import tkinter as tk
from tkinter import messagebox, filedialog
from datetime import datetime
from pathlib import Path
import threading
import logging

# -----------------------------------------------------------

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# -----------------------------------------------------------

def generate_pathways():
    folder_path = folder_path_var.get().strip()
    
    if not folder_path:
        messagebox.showwarning("Input Required", "Please enter or select a folder path.")
        return

    folder = Path(folder_path)
    
    if not folder.exists():
        messagebox.showerror("Invalid Path", "The specified folder path does not exist.")
        return

    if not folder.is_dir():
        messagebox.showerror("Invalid Path", "The specified path is not a folder.")
        return

    generate_button.config(state=tk.DISABLED)
    status_label.config(text="Generating pathways...")

    def worker():
        pathways = []
        try:
            for file_path in folder.rglob('*'):
                if file_path.is_file():
                    pathways.append(str(file_path.resolve()))
        except Exception as e:
            logging.error(f"Error while accessing the folder: {e}")
            messagebox.showerror("Error", f"An error occurred while accessing the folder:\n{e}")
            update_ui_after_generation(success=False)
            return

        if not pathways:
            messagebox.showinfo("No Files Found", "The selected folder contains no files.")
            update_ui_after_generation(success=False)
            return

        text_content = "\n".join(pathways)

        default_filename = f"pathways_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        output_file = filedialog.asksaveasfilename(
            defaultextension=".txt",
            initialfile=default_filename,
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )

        if not output_file:
            update_ui_after_generation(success=False)
            return

        try:
            with open(output_file, 'w', encoding='utf-8') as file:
                file.write(text_content)
            messagebox.showinfo("Success", f"Pathways have been saved to:\n{output_file}")
            logging.info(f"Pathways saved to {output_file}")
        except Exception as e:
            logging.error(f"Error while saving the file: {e}")
            messagebox.showerror("Error", f"An error occurred while saving the file:\n{e}")
        finally:
            update_ui_after_generation(success=True)

    threading.Thread(target=worker, daemon=True).start()

# -----------------------------------------------------------

def update_ui_after_generation(success):
    generate_button.config(state=tk.NORMAL)
    status_text = "Generation complete." if success else "Ready."
    status_label.config(text=status_text)

# -----------------------------------------------------------

def browse_folder():
    selected_folder = filedialog.askdirectory()
    if selected_folder:
        folder_path_var.set(selected_folder)

# -----------------------------------------------------------

root = tk.Tk()
root.title("Pathways Generator")
root.geometry("600x200")
root.resizable(False, False)

bg_color = '#2D2D2D'
root.configure(bg=bg_color)

folder_path_var = tk.StringVar()

default_font = ("Segoe UI", 12)

# -----------------------------------------------------------

frame = tk.Frame(root, padx=20, pady=20, bg=bg_color)
frame.pack(fill=tk.BOTH, expand=True)

# -----------------------------------------------------------

instruction_label = tk.Label(
    frame, 
    text="Please enter or select the folder path:", 
    bg=bg_color, 
    fg='white', 
    font=default_font
)
instruction_label.grid(row=0, column=0, sticky=tk.W, pady=(0, 10))

# -----------------------------------------------------------

folder_entry = tk.Entry(
    frame, 
    textvariable=folder_path_var, 
    width=50, 
    fg='white', 
    bg='#3C3C3C', 
    font=default_font,
    insertbackground='white'
)
folder_entry.grid(row=1, column=0, padx=(0,10), pady=5, sticky=tk.W)

# -----------------------------------------------------------

browse_button = tk.Button(
    frame,
    text="Browse",
    command=browse_folder,
    bg='#4CAF50',
    fg='white',
    font=default_font,
    activebackground='#45a049',
    activeforeground='white',
    bd=0,
    highlightthickness=0,
    padx=10,
    pady=5
)
browse_button.grid(row=1, column=1, pady=5, sticky=tk.W)

# -----------------------------------------------------------

generate_button = tk.Button(
    frame, 
    text="Generate", 
    command=generate_pathways, 
    bg='#000000',
    fg='white', 
    width=15, 
    height=2,
    font=("Segoe UI", 12, "bold"),
    activebackground='#333333',
    activeforeground='white',
    bd=0,
    highlightthickness=0
)
generate_button.grid(row=2, column=0, columnspan=2, pady=20)

# -----------------------------------------------------------

status_label = tk.Label(
    frame, 
    text="Ready.", 
    bg=bg_color, 
    fg='#B0B0B0', 
    font=("Segoe UI", 10, "italic")
)
status_label.grid(row=3, column=0, columnspan=2, sticky=tk.W)

# -----------------------------------------------------------

root.mainloop()
