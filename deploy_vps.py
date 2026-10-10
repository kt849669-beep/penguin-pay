import paramiko

host = "187.127.174.38"
username = "root"
password = "Khusheeram@12"

commands = """
set -e
echo "Starting deployment..."
mkdir -p /var/www
cd /var/www
if [ -d "penguin-pay" ]; then
  echo "Directory exists, pulling changes..."
  cd penguin-pay
  git reset --hard HEAD
  git pull
else
  echo "Cloning repository..."
  git clone https://github.com/kt849669-beep/penguin-pay.git
  cd penguin-pay
fi

echo "Installing dependencies and building..."
npm install
npm run build

echo "Setting up Nginx..."
cat << 'EOF' > /etc/nginx/conf.d/penguin-pay.conf
server {
    listen 80;
    server_name penguin-pay.online www.penguin-pay.online;

    root /var/www/penguin-pay/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

nginx -t
systemctl reload nginx
echo "Deployment finished successfully."
"""

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, username=username, password=password, timeout=15)
    
    stdin, stdout, stderr = ssh.exec_command(commands)
    
    # We should wait for command to finish and print output
    exit_status = stdout.channel.recv_exit_status()
    print("Exit status:", exit_status)
    print("STDOUT:", stdout.read().decode())
    print("STDERR:", stderr.read().decode())
    
    ssh.close()
except Exception as e:
    print(f"Failed to connect: {e}")
