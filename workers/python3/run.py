import subprocess, time, resource, json

MAX_MEMO = 128
MAX_TIME = 2

with open("./config.json") as f:
    f = f.read()
    config = json.loads(f)

    MAX_MEMO = config["maxMemory"]
    MAX_TIME = config["maxTime"]


resource.setrlimit(resource.RLIMIT_AS, (MAX_MEMO*1024*1024, MAX_MEMO*1024*1024))


start = time.monotonic()

p = subprocess.Popen(
    ["python3", "current.py"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)

test = "a"

status = None

try:
    stdout, stderr = p.communicate(test, timeout=MAX_TIME)
    elapsed = time.monotonic() - start
    
    if p.returncode == 0:
        status = "OK"
    else:
        status = "RE"

except subprocess.TimeoutExpired:
    p.kill()
    stdout, stderr = "", ""
    status = "T"
    elapsed = MAX_TIME




out = json.dumps({
    "out": stdout,
    "err": stderr,
    "time": elapsed,
    "exit": p.returncode,
    "status": status,
    "resources": resource.getrusage(resource.RUSAGE_CHILDREN)
})

print(out)