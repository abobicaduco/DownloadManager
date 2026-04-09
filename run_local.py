import os
import sys
import subprocess
import time
import threading

# --- AUTO-INSTALLER ---
def install_dependencies():
    required = ['pywebview', 'aria2p']
    for package in required:
        try:
            __import__(package)
        except ImportError:
            print(f"Instalando {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])

install_dependencies()

import webview
import aria2p

# --- BACKEND LOGIC ---
class AbobiAPI:
    def __init__(self):
        self.window = None
        self.aria2 = None
        self.aria2_process = None
        self.connect_aria2()

    def connect_aria2(self):
        try:
            # Tenta conectar ao aria2c
            self.aria2 = aria2p.API(aria2p.Client(host="http://localhost", port=6800, secret=""))
            self.aria2.get_downloads()
            print("Conectado ao aria2c.")
        except:
            print("Iniciando aria2c...")
            try:
                # Tenta iniciar o processo (assume que aria2c está no PATH)
                self.aria2_process = subprocess.Popen(
                    ["aria2c", "--enable-rpc", "--rpc-listen-all", "--rpc-allow-origin-all"],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    shell=True if os.name == 'nt' else False
                )
                time.sleep(2)
                self.aria2 = aria2p.API(aria2p.Client(host="http://localhost", port=6800, secret=""))
            except Exception as e:
                print(f"Erro ao iniciar aria2c: {e}. Certifique-se que o aria2c está instalado.")

    def download_link(self, url, folder):
        if not self.aria2:
            return {"status": "error", "message": "Aria2c não está rodando."}
        try:
            if not os.path.exists(folder):
                os.makedirs(folder)
            download = self.aria2.add(url, options={"dir": folder})
            return {"status": "success", "gid": download.gid}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def get_queue(self):
        if not self.aria2: return []
        try:
            downloads = self.aria2.get_downloads()
            return [{
                "gid": dl.gid,
                "name": dl.name,
                "progress": dl.progress,
                "speed": dl.download_speed_string,
                "status": dl.status,
                "error": dl.error_message if dl.has_error else None
            } for dl in downloads]
        except:
            return []

    def clear_history(self):
        if not self.aria2: return {"status": "error"}
        try:
            # Remove concluídos e erros da fila do aria2
            downloads = self.aria2.get_downloads()
            for dl in downloads:
                if dl.is_complete or dl.has_error:
                    self.aria2.remove([dl], force=True, files=True)
            return {"status": "success"}
        except:
            return {"status": "error"}

    def minimize_app(self):
        if self.window: self.window.minimize()

    def close_app(self):
        if self.window: self.window.destroy()

    def cleanup(self):
        if self.aria2_process:
            self.aria2_process.terminate()

# --- MAIN APP ---
def run():
    api = AbobiAPI()
    
    # URL do app (pode ser o link do Cloud Run ou localhost se estiver rodando o build)
    # Para este exemplo, vamos usar a URL do preview atual
    app_url = "https://ais-dev-qcwqrqzl2k2dbbwe6joddp-369291194979.us-east1.run.app"
    
    window = webview.create_window(
        'AbobiDownloader',
        url=app_url,
        js_api=api,
        width=750,
        height=600,
        transparent=True,
        frame=False
    )
    api.window = window
    window.events.closed += api.cleanup
    
    webview.start()

if __name__ == "__main__":
    run()
