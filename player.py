import pygame


class MusicPlayer:
    def __init__(self):
        self._initialized = False

    def init(self):
        if not self._initialized:
            pygame.mixer.init()
            self._initialized = True

    def load(self, filepath):
        self.init()
        pygame.mixer.music.load(filepath)

    def play(self):
        self.init()
        pygame.mixer.music.play()

    def pause(self):
        pygame.mixer.music.pause()

    def unpause(self):
        pygame.mixer.music.unpause()

    def stop(self):
        pygame.mixer.music.stop()
