import os
import subprocess
import sys


def main():
    project_root = os.path.dirname(os.path.abspath(__file__))
    manage_py = os.path.join(project_root, "manage.py")

    command = [sys.executable, manage_py, "sync_tmdb_catalog"] + sys.argv[1:]
    raise SystemExit(subprocess.call(command, cwd=project_root))


if __name__ == "__main__":
    main()
