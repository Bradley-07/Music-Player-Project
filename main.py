from tkinter import filedialog
from tkinter import *
import os

from player import MusicPlayer

def main():
    root = Tk()
    root.title("Music Player")
    root.geometry("500x300")

    player = MusicPlayer()
    player.init()

# menu where you import the file 
    menubar = Menu(root)
    root.config(menu = menubar)

    #songs
    songs = []
    current_song = ""
    music_directory = ""
    is_playing = False


    #loading music from a folder
    def load_music():
        nonlocal current_song, music_directory
        music_directory = filedialog.askdirectory()

        for song in os.listdir(music_directory):
            name, ext = os.path.splitext(song)
            if ext == '.mp3':
                songs.append(song)

        for song in songs:
            songlist.insert("end", song)
        
        songlist.selection_set(0)
        current_song = songs[songlist.curselection()[0]]
    
    #play music
    def play_music():
        nonlocal current_song, music_directory

        if current_song and music_directory:
            player.load(os.path.join(music_directory, current_song))
            player.play()

    def pause_music():
        player.pause()

    def skip_music():
        nonlocal current_song
        if not songs:
            return
        try:
            current_index = songs.index(current_song)
        except ValueError:
            current_index = -1

        next_index = (current_index + 1) % len(songs)
        songlist.selection_clear(0, END)
        songlist.selection_set(next_index)
        current_song = songs[next_index]
        play_music()

    def rewind_music():
        nonlocal current_song
        if not songs:
            return
        try:
            current_index = songs.index(current_song)
        except ValueError:
            current_index = 0

        prev_index = (current_index - 1) % len(songs)
        songlist.selection_clear(0, END)
        songlist.selection_set(prev_index)
        current_song = songs[prev_index]
        play_music()


# menu
    organize_menu = Menu(menubar, tearoff=False)
    organize_menu.add_command(label = 'Select Folder', command=load_music)
    menubar.add_cascade(label = 'Menu',menu = organize_menu)


#playlist box
    playlist_box = Listbox(root, bg="black", fg="white")
    playlist_box.place(x=0, y=0, relwidth=0.3, height=250)


#songlists box
    songlist = Listbox(root, bg="black", fg="white")
    songlist.place(relx=0.3, y=0, relwidth=0.7, height=250)

#image for the buttons
    play_image = PhotoImage(file="play.png")
    pause_image = PhotoImage(file="pause.png")
    skip_image = PhotoImage(file="next.png")
    rewind_image = PhotoImage(file="previous.png")

#frame
    control_frame = Frame(root)
    control_frame.pack(side=BOTTOM, fill=X)
    button_frame = Frame(control_frame)
    button_frame.pack(pady=10)

#toggle the play and pause button
    is_playing = False

    def toggle_play():
        nonlocal is_playing, current_song
        if is_playing:
            pause_music()
            play_pause_button.config(image=play_image)
            is_playing = False
        else:
            if not current_song and songs:
                songlist.selection_set(0)
                current_song = songs[0]
            play_music()
            play_pause_button.config(image=pause_image)
            is_playing = True

#button
    rewind_button = Button(
        button_frame,
        image=rewind_image,
        borderwidth=0,
        command=rewind_music,
    )
    play_pause_button = Button(
        button_frame,
        image=play_image,
        borderwidth=0,
        command=toggle_play,
    )
    skip_button = Button(
        button_frame,
        image=skip_image,
        borderwidth=0,
        command=skip_music,
    )

#the pack/ space for the buttons
    rewind_button.pack(side=LEFT, padx=12)
    play_pause_button.pack(side=LEFT, padx=12)
    skip_button.pack(side=LEFT, padx=12)




    root.mainloop()


if __name__ == "__main__":
    main()
