import paramiko

host = "187.127.174.38"
username = "root"
password = "Khusheeram@12"

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, username=username, password=password, timeout=10)
    
    stdin, stdout, stderr = ssh.exec_command("docker ps; pm2 list; nginx -t; netstat -tuln")
    print(stdout.read().decode())
    print(stderr.read().decode())
    ssh.close()
except Exception as e:
    print(f"Failed to connect: {e}")
