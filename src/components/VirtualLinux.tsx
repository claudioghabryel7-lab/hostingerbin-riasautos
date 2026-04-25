'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, Monitor, HardDrive, Cpu, Network, Zap, FileText, Folder, Settings, Users, Lock, Globe, Database, Code, Package, Cloud, Server } from 'lucide-react';

interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: Record<string, FileSystemNode>;
  permissions: string;
  owner: string;
  group: string;
  size: number;
  createdAt: Date;
  modifiedAt: Date;
}

interface Process {
  pid: number;
  name: string;
  status: 'running' | 'stopped' | 'zombie';
  cpu: number;
  memory: number;
  user: string;
  command: string;
  startTime: Date;
}

interface SystemInfo {
  hostname: string;
  kernel: string;
  uptime: number;
  users: number;
  loadAverage: [number, number, number];
  memory: {
    total: number;
    used: number;
    free: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
  };
}

export function VirtualLinux() {
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'Virtual Linux Terminal v1.0',
    'Type "help" for available commands',
    'user@virtual-linux:~$ '
  ]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState('/home/user');
  const [user, setUser] = useState('user');
  const [hostname, setHostname] = useState('virtual-linux');
  const [fileSystem, setFileSystem] = useState<Record<string, FileSystemNode>>({});
  const [processes, setProcesses] = useState<Process[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    hostname: 'virtual-linux',
    kernel: '5.15.0-virtual',
    uptime: 0,
    users: 1,
    loadAverage: [0.1, 0.2, 0.3],
    memory: { total: 8192, used: 2048, free: 6144 },
    disk: { total: 50000, used: 10000, free: 40000 }
  });
  const [nextPid, setNextPid] = useState(1000);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize file system
  useEffect(() => {
    const initialFS: Record<string, FileSystemNode> = {
      '/': {
        name: '/',
        type: 'directory',
        children: {
          'home': {
            name: 'home',
            type: 'directory',
            permissions: 'rwxr-xr-x',
            owner: 'root',
            group: 'root',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              'user': {
                name: 'user',
                type: 'directory',
                permissions: 'rwxr-xr-x',
                owner: 'user',
                group: 'user',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  'Documents': {
                    name: 'Documents',
                    type: 'directory',
                    permissions: 'rwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    size: 4096,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    children: {}
                  },
                  'Downloads': {
                    name: 'Downloads',
                    type: 'directory',
                    permissions: 'rwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    size: 4096,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    children: {}
                  },
                  'Desktop': {
                    name: 'Desktop',
                    type: 'directory',
                    permissions: 'rwxr-xr-x',
                    owner: 'user',
                    group: 'user',
                    size: 4096,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    children: {}
                  },
                  '.bashrc': {
                    name: '.bashrc',
                    type: 'file',
                    content: '# .bashrc\nexport PS1="\\[\\e[32m\\]\\u@\\h:\\w\\$\\[\\e[0m\\] "\nalias ll="ls -la"\nalias la="ls -la"\n',
                    permissions: 'rw-r--r--',
                    owner: 'user',
                    group: 'user',
                    size: 120,
                    createdAt: new Date(),
                    modifiedAt: new Date()
                  }
                }
              }
            }
          },
          'bin': {
            name: 'bin',
            type: 'directory',
            permissions: 'rwxr-xr-x',
            owner: 'root',
            group: 'root',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {}
          },
          'etc': {
            name: 'etc',
            type: 'directory',
            permissions: 'rwxr-xr-x',
            owner: 'root',
            group: 'root',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              'passwd': {
                name: 'passwd',
                type: 'file',
                content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash\n',
                permissions: 'rw-r--r--',
                owner: 'root',
                group: 'root',
                size: 80,
                createdAt: new Date(),
                modifiedAt: new Date()
              }
            }
          },
          'var': {
            name: 'var',
            type: 'directory',
            permissions: 'rwxr-xr-x',
            owner: 'root',
            group: 'root',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              'log': {
                name: 'log',
                type: 'directory',
                permissions: 'rwxr-xr-x',
                owner: 'root',
                group: 'root',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {}
              }
            }
          },
          'usr': {
            name: 'usr',
            type: 'directory',
            permissions: 'rwxr-xr-x',
            owner: 'root',
            group: 'root',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              'bin': {
                name: 'bin',
                type: 'directory',
                permissions: 'rwxr-xr-x',
                owner: 'root',
                group: 'root',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {}
              }
            }
          }
        },
        permissions: 'rwxr-xr-x',
        owner: 'root',
        group: 'root',
        size: 4096,
        createdAt: new Date(),
        modifiedAt: new Date()
      }
    };
    setFileSystem(initialFS);
  }, []);

  // Update uptime
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemInfo(prev => ({ ...prev, uptime: prev.uptime + 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getNodeAtPath = (path: string): FileSystemNode | null => {
    const parts = path.split('/').filter(p => p);
    let current = fileSystem['/'];
    
    for (const part of parts) {
      if (current.children && current.children[part]) {
        current = current.children[part];
      } else {
        return null;
      }
    }
    return current;
  };

  const executeCommand = useCallback((command: string) => {
    const parts = command.trim().split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);
    
    let output = '';
    
    switch (cmd) {
      case 'help':
        output = `Available commands:
  ls - List directory contents
  cd - Change directory
  pwd - Print working directory
  mkdir - Create directory
  touch - Create file
  cat - Display file contents
  nano - Text editor
  vim - Text editor
  cp - Copy files
  mv - Move files
  rm - Remove files
  chmod - Change permissions
  chown - Change owner
  ps - List processes
  kill - Kill process
  top - System monitor
  df - Disk usage
  free - Memory usage
  uname - System information
  whoami - Current user
  id - User ID
  date - Current date/time
  uptime - System uptime
  history - Command history
  clear - Clear screen
  echo - Display message
  grep - Search text
  find - Find files
  wc - Word count
  head - Display first lines
  tail - Display last lines
  sort - Sort lines
  uniq - Unique lines
  diff - Compare files
  tar - Archive files
  gzip - Compress files
  ping - Network test
  wget - Download files
  curl - Transfer data
  ssh - SSH client
  git - Git commands
  npm - Node package manager
  python - Python interpreter
  node - Node.js runtime
  java - Java runtime
  gcc - C compiler
  make - Build tool
  systemctl - System service
  journalctl - System logs
  mount - Mount filesystem
  umount - Unmount filesystem
  fdisk - Disk partitioning
  lsblk - List block devices
  ip - Network configuration
  netstat - Network statistics
  ss - Socket statistics
  firewall-cmd - Firewall management
  selinux - SELinux management
  crontab - Schedule tasks
  at - Schedule tasks
  nohup - Run commands immune to hangups
  screen - Terminal multiplexer
  tmux - Terminal multiplexer
  rsync - Sync files
  scp - Secure copy
  sftp - Secure FTP
  ftp - FTP client
  telnet - Telnet client
  nslookup - DNS lookup
  dig - DNS lookup
  host - DNS lookup
  traceroute - Trace route
  nmap - Network scanner
  tcpdump - Packet capture
  wireshark - Network analyzer
  apache2 - Apache web server
  nginx - Nginx web server
  mysql - MySQL database
  postgresql - PostgreSQL database
  redis - Redis database
  mongodb - MongoDB database
  docker - Docker container
  kubectl - Kubernetes
  ansible - Automation
  puppet - Configuration management
  chef - Configuration management
  salt - Configuration management
  vagrant - Virtual machine
  virtualbox - Virtual machine
  vmware - Virtual machine
  qemu - Emulator
  kvm - Kernel virtual machine
  xen - Hypervisor
  openstack - Cloud platform
  aws - Amazon Web Services
  azure - Microsoft Azure
  gcloud - Google Cloud
  kubernetes - Container orchestrator
  helm - Kubernetes package manager
  istio - Service mesh
  prometheus - Monitoring
  grafana - Visualization
  elk - Elastic stack
  fluentd - Log collector
  jaeger - Distributed tracing
  zip - Archive files
  unzip - Extract files
  rar - Archive files
  unrar - Extract files
  7z - Archive files
  sha256sum - Checksum
  md5sum - Checksum
  gpg - Encryption
  openssl - SSL/TLS tools
  ssh-keygen - SSH key generation
  rsync - Sync files
  dd - Disk cloning
  shred - Secure delete
  wipe - Secure delete
  cryptsetup - Encryption
  lvm - Logical volume management
  raid - RAID management
  btrfs - Btrfs filesystem
  ext4 - Ext4 filesystem
  xfs - XFS filesystem
  zfs - ZFS filesystem`;
        break;
        
      case 'ls':
        const current = getNodeAtPath(currentDirectory);
        if (current && current.children) {
          const files = Object.keys(current.children);
          const showAll = args.includes('-a');
          const longFormat = args.includes('-l');
          
          if (showAll) {
            files.push('.', '..');
          }
          
          if (longFormat) {
            output = files.map(file => {
              const node = file === '.' ? current : file === '..' ? getNodeAtPath(currentDirectory.split('/').slice(0, -1).join('/') || '/') : current.children![file];
              if (!node) return '';
              return `${node.permissions} ${node.owner} ${node.group} ${node.size.toString().padStart(8)} ${node.modifiedAt.toLocaleDateString()} ${node.name}`;
            }).join('\n');
          } else {
            output = files.join('  ');
          }
        } else {
          output = 'Directory not found';
        }
        break;
        
      case 'pwd':
        output = currentDirectory;
        break;
        
      case 'cd':
        if (args.length === 0) {
          setCurrentDirectory('/home/user');
        } else {
          const target = args[0];
          let newPath: string;
          
          if (target.startsWith('/')) {
            newPath = target;
          } else if (target === '..') {
            newPath = currentDirectory.split('/').slice(0, -1).join('/') || '/';
          } else {
            newPath = currentDirectory === '/' ? `/${target}` : `${currentDirectory}/${target}`;
          }
          
          const node = getNodeAtPath(newPath);
          if (node && node.type === 'directory') {
            setCurrentDirectory(newPath);
          } else {
            output = `cd: ${target}: No such file or directory`;
          }
        }
        break;
        
      case 'mkdir':
        if (args.length === 0) {
          output = 'mkdir: missing operand';
        } else {
          const dirName = args[0];
          const current = getNodeAtPath(currentDirectory);
          if (current && current.children) {
            current.children[dirName] = {
              name: dirName,
              type: 'directory',
              permissions: 'rwxr-xr-x',
              owner: user,
              group: user,
              size: 4096,
              createdAt: new Date(),
              modifiedAt: new Date(),
              children: {}
            };
            setFileSystem({ ...fileSystem });
          }
        }
        break;
        
      case 'touch':
        if (args.length === 0) {
          output = 'touch: missing file operand';
        } else {
          const fileName = args[0];
          const current = getNodeAtPath(currentDirectory);
          if (current && current.children) {
            current.children[fileName] = {
              name: fileName,
              type: 'file',
              content: '',
              permissions: 'rw-r--r--',
              owner: user,
              group: user,
              size: 0,
              createdAt: new Date(),
              modifiedAt: new Date()
            };
            setFileSystem({ ...fileSystem });
          }
        }
        break;
        
      case 'cat':
        if (args.length === 0) {
          output = 'cat: missing file operand';
        } else {
          const fileName = args[0];
          const current = getNodeAtPath(currentDirectory);
          if (current && current.children && current.children[fileName]) {
            const file = current.children[fileName];
            if (file.type === 'file') {
              output = file.content || '';
            } else {
              output = `cat: ${fileName}: Is a directory`;
            }
          } else {
            output = `cat: ${fileName}: No such file or directory`;
          }
        }
        break;
        
      case 'echo':
        output = args.join(' ');
        break;
        
      case 'whoami':
        output = user;
        break;
        
      case 'uname':
        const flag = args[0];
        if (flag === '-a') {
          output = `${systemInfo.hostname} ${systemInfo.kernel} #1 SMP ${new Date().toLocaleDateString()} x86_64 GNU/Linux`;
        } else if (flag === '-r') {
          output = systemInfo.kernel;
        } else if (flag === '-n') {
          output = systemInfo.hostname;
        } else {
          output = 'Linux';
        }
        break;
        
      case 'date':
        output = new Date().toString();
        break;
        
      case 'uptime':
        const hours = Math.floor(systemInfo.uptime / 3600);
        const minutes = Math.floor((systemInfo.uptime % 3600) / 60);
        output = ` up ${hours}:${minutes.toString().padStart(2, '0')}, 1 user, load average: ${systemInfo.loadAverage.join(', ')}`;
        break;
        
      case 'ps':
        const psFormat = args[0];
        if (psFormat === 'aux') {
          output = `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.1   2000  500 ?        S    10:00   0:00 /sbin/init
root         100  0.0  0.2   3000  800 ?        S    10:00   0:00 /usr/sbin/sshd
${user}        200  0.0  0.1   2500  600 pts/0    S    10:01   0:00 -bash
${user}        300  0.0  0.1   2200  500 pts/0    R    10:02   0:00 ps aux`;
        } else {
          output = `  PID TTY          TIME CMD
  200 pts/0    00:00:00 -bash
  300 pts/0    00:00:00 ps`;
        }
        break;
        
      case 'top':
        output = `top - ${new Date().toLocaleTimeString()} up ${Math.floor(systemInfo.uptime / 3600)}:${Math.floor((systemInfo.uptime % 3600) / 60).toString().padStart(2, '0')}, 1 user, load average: ${systemInfo.loadAverage.join(', ')}
Tasks: 1 total, 1 running, 0 sleeping, 0 stopped, 0 zombie
%Cpu(s):  5.0 us,  2.0 sy,  0.0 ni, 93.0 id, 0.0 wa, 0.0 hi, 0.0 si, 0.0 st
MiB Mem :   8192.0 total,   2048.0 used,   6144.0 free,    0.0 buff/cache
MiB Swap:      0.0 total,      0.0 used,      0.0 free.   0.0 avail Mem

  PID USER      PR  NI VIRT    RES    SHR S %CPU %MEM     TIME+ COMMAND
  200 user      20   0  2500    600    500 S  0.0  0.1   0:00.01 bash
  300 user      20   0  2200    500    400 R  0.0  0.1   0:00.00 top`;
        break;
        
      case 'df':
        output = `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   10G   40G  20% /
tmpfs           2.0G     0  2.0G   0% /dev/shm
tmpfs           800M  100M  700M  13% /run
tmpfs           400M     0  400M   0% /sys/fs/cgroup`;
        break;
        
      case 'free':
        const freeFlag = args[0];
        if (freeFlag === '-h') {
          output = `              total        used        free      shared  buff/cache   available
Mem:           8.0G        2.0G        6.0G        0B        0B        6.0G
Swap:          0B          0B          0B`;
        } else {
          output = `              total        used        free      shared  buff/cache   available
Mem:        8388608     2097152     6291456           0           0     6291456
Swap:            0           0           0`;
        }
        break;
        
      case 'id':
        output = `uid=1000(${user}) gid=1000(${user}) groups=1000(${user}),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),120(lpadmin),131(lxd),132(sambashare)`;
        break;
        
      case 'clear':
        setTerminalHistory([`${user}@${hostname}:${currentDirectory}$ `]);
        return;
        
      case 'nano':
      case 'vim':
        if (args.length === 0) {
          output = `${cmd}: missing file operand`;
        } else {
          output = `${cmd}: ${args[0]} - File editor would open here (simulated)`;
        }
        break;
        
      case 'history':
        output = terminalHistory.filter(line => line.includes('$ ')).map(line => line.split('$ ')[1]).join('\n');
        break;
        
      case 'grep':
        if (args.length < 2) {
          output = 'grep: missing pattern and file';
        } else {
          output = `grep: ${args[1]} - Pattern search would be performed here (simulated)`;
        }
        break;
        
      case 'find':
        if (args.length === 0) {
          output = 'find: missing path';
        } else {
          output = `find: ${args[0]} - File search would be performed here (simulated)`;
        }
        break;
        
      case 'chmod':
        if (args.length < 2) {
          output = 'chmod: missing mode and file';
        } else {
          output = `chmod: ${args[1]} - Permissions changed to ${args[0]} (simulated)`;
        }
        break;
        
      case 'chown':
        if (args.length < 2) {
          output = 'chown: missing owner and file';
        } else {
          output = `chown: ${args[1]} - Owner changed to ${args[0]} (simulated)`;
        }
        break;
        
      case 'cp':
        if (args.length < 2) {
          output = 'cp: missing file operand';
        } else {
          output = `cp: ${args[0]} ${args[1]} - File copied (simulated)`;
        }
        break;
        
      case 'mv':
        if (args.length < 2) {
          output = 'mv: missing file operand';
        } else {
          output = `mv: ${args[0]} ${args[1]} - File moved (simulated)`;
        }
        break;
        
      case 'rm':
        if (args.length === 0) {
          output = 'rm: missing operand';
        } else {
          output = `rm: ${args[0]} - File removed (simulated)`;
        }
        break;
        
      case 'kill':
        if (args.length === 0) {
          output = 'kill: missing process ID';
        } else {
          output = `kill: ${args[0]} - Process killed (simulated)`;
        }
        break;
        
      case 'ping':
        if (args.length === 0) {
          output = 'ping: missing host';
        } else {
          output = `PING ${args[0]} (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.123 ms
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.098 ms
64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.105 ms`;
        }
        break;
        
      case 'wget':
        if (args.length === 0) {
          output = 'wget: missing URL';
        } else {
          output = `wget: ${args[0]} - Download would start here (simulated)`;
        }
        break;
        
      case 'curl':
        if (args.length === 0) {
          output = 'curl: missing URL';
        } else {
          output = `curl: ${args[0]} - HTTP request would be sent here (simulated)`;
        }
        break;
        
      case 'ssh':
        if (args.length === 0) {
          output = 'ssh: missing hostname';
        } else {
          output = `ssh: ${args[0]} - SSH connection would be established here (simulated)`;
        }
        break;
        
      case 'git':
        if (args.length === 0) {
          output = `git: missing command
usage: git [--version] [--help] [-C <path>] [-c <name>=<value>]
           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]
           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]
           <command> [<args>]`;
        } else {
          output = `git: ${args.join(' ')} - Git command would be executed here (simulated)`;
        }
        break;
        
      case 'npm':
        if (args.length === 0) {
          output = `npm: missing command
Usage: npm <command>

where <command> is one of:
    access, adduser, audit, bin, bugs, cache, ci, completion,
    config, dedupe, deprecate, diff, dist-tag, docs, doctor,
    edit, exec, explain, fix, fund, get, help, hook, init,
    install, install-ci-test, install-test, link, login, logout,
    ls, org, outdated, owner, pack, ping, prefix, profile,
    prune, publish, query, rebuild, repo, restart, root,
    run, run-script, search, set, shrinkwrap, star, stars,
    start, stop, team, test, token, uninstall, unstar,
    update, version, view, whoami`;
        } else {
          output = `npm: ${args.join(' ')} - NPM command would be executed here (simulated)`;
        }
        break;
        
      case 'python':
      case 'python3':
        if (args.length === 0) {
          output = `Python 3.9.7 (default, Sep 10 2021, 14:59:43)
[GCC 11.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>`;
        } else {
          output = `python: ${args.join(' ')} - Python script would be executed here (simulated)`;
        }
        break;
        
      case 'node':
        if (args.length === 0) {
          output = 'Welcome to Node.js v16.13.1.\nType ".help" for more information.';
        } else {
          output = `node: ${args.join(' ')} - Node.js script would be executed here (simulated)`;
        }
        break;
        
      case 'java':
        if (args.length === 0) {
          output = `Usage: java [options] <mainclass> [args...]
           (to execute a class)
   or  java [options] -jar <jarfile> [args...]
           (to execute a jar file)
   or  java [options] -m <module>[/<mainclass>] [args...]
           (to execute a module in a module path)`;
        } else {
          output = `java: ${args.join(' ')} - Java program would be executed here (simulated)`;
        }
        break;
        
      case 'gcc':
        if (args.length === 0) {
          output = 'gcc: no input files';
        } else {
          output = `gcc: ${args.join(' ')} - C program would be compiled here (simulated)`;
        }
        break;
        
      case 'make':
        if (args.length === 0) {
          output = 'make: *** No targets specified and no makefile found.  Stop.';
        } else {
          output = `make: ${args.join(' ')} - Make command would be executed here (simulated)`;
        }
        break;
        
      case 'systemctl':
        if (args.length === 0) {
          output = `systemctl: missing command
Usage: systemctl [OPTIONS...] {COMMAND}
       ...
Query unit commands:
  status                   Show status of one or more units
  is-active                Check whether units are active
  is-enabled               Check whether unit files are enabled
  is-failed                Check whether units are failed
  list-units              List loaded units
  list-unit-files         List installed unit files`;
        } else {
          output = `systemctl: ${args.join(' ')} - System service command would be executed here (simulated)`;
        }
        break;
        
      case 'journalctl':
        output = `-- Logs begin at ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}. --
${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} ${hostname} systemd[1]: Started Virtual Linux System.
${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} ${hostname} systemd[1]: Started Login Service.
${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} ${hostname} systemd[1]: Started User Login Service.`;
        break;
        
      case 'mount':
        output = `proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)
sysfs on /sys type sysfs (rw,nosuid,nodev,noexec,relatime)
devtmpfs on /dev type devtmpfs (rw,nosuid,noexec,relatime,size=4096000k,nr_inodes=1024000,mode=755)
securityfs on /sys/kernel/security type securityfs (rw,nosuid,nodev,noexec,relatime)
tmpfs on /dev/shm type tmpfs (rw,nosuid,nodev,noexec)
devpts on /dev/pts type devpts (rw,nosuid,noexec,relatime,gid=5,mode=620,ptmxmode=000)
tmpfs on /run type tmpfs (rw,nosuid,nodev,noexec,relatime,size=819200k,mode=755)
/dev/sda1 on / type ext4 (rw,relatime)`;
        break;
        
      case 'umount':
        if (args.length === 0) {
          output = 'umount: missing target';
        } else {
          output = `umount: ${args[0]} - Filesystem unmounted (simulated)`;
        }
        break;
        
      case 'fdisk':
        if (args.length === 0) {
          output = `fdisk: missing device
Usage: fdisk [options] <disk>    change partition table
       fdisk [options] -l <disk> list partition table(s)
       fdisk -s <partition>      give partition size(s) in blocks`;
        } else {
          output = `fdisk: ${args[0]} - Disk partitioning would be performed here (simulated)`;
        }
        break;
        
      case 'lsblk':
        output = `NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda      8:0    0   50G  0 disk
└─sda1   8:1    0   50G  0 part /`;
        break;
        
      case 'ip':
        if (args.length === 0) {
          output = `Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }
       ip [ -force ] -batch filename
OBJECT := { link | address | addrlabel | route | rule | neigh | ntable |
           tunnel | tuntap | maddr | mroute | mrule | watch | xfrm |
           netns | l2tp | fou | macsec | tcp_metrics | token | netconf }
OPTIONS := { -V[1] | -c | -color | -br | -p | -pretty | -s | -statistics |
           -h | -human | -iec | -j | -json | -p | -pretty | -f | -family |
           -4 | -6 | -I | -i | -interface | -o | -oneline | -r | -resolve |
           -t | -timestamp | -ts | -tshort | -T | -traditional | -l | -length |
           -N | -netns | -a | -all | -g | -global }`;
        } else if (args[0] === 'addr') {
          output = `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:16:3e:xx:xx:xx brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::216:3eff:fe00:100/64 scope link
       valid_lft forever preferred_lft forever`;
        } else {
          output = `ip: ${args.join(' ')} - Network command would be executed here (simulated)`;
        }
        break;
        
      case 'netstat':
        output = `Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 192.168.1.100:22       192.168.1.1:1234       ESTABLISHED
tcp        0      0 127.0.0.1:631           0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
udp        0      0 0.0.0.0:68              0.0.0.0:*`;
        break;
        
      case 'ss':
        output = `Netid State      Recv-Q Send-Q Local Address:Port Peer Address:Port
tcp   ESTAB      0      0      192.168.1.100:22  192.168.1.1:1234
tcp   LISTEN      0      5            0.0.0.0:22         0.0.0.0:*
tcp   LISTEN      0      5          127.0.0.1:631        0.0.0.0:*`;
        break;
        
      case 'firewall-cmd':
        if (args.length === 0) {
          output = `Usage: firewall-cmd [OPTIONS...]
Options:
  --state                           show runtime status
  --reload                          reload firewall
  --get-zones                      list zones
  --get-active-zones               list active zones
  --set-default-zone=<zone>        set default zone
  --get-default-zone               print default zone
  --zone=<zone> ...                specify zone`;
        } else {
          output = `firewall-cmd: ${args.join(' ')} - Firewall command would be executed here (simulated)`;
        }
        break;
        
      case 'crontab':
        if (args.includes('-l')) {
          output = `# Edit this file to introduce tasks to be run by cron.
# Each task to run has to be defined through a single line
# indicating with different fields when the task will be run and
# what command to run for the task
# To define the time you can provide concrete values for
# minute (m), hour (h), day of month (dom), month (mon),
# and day of week (dow) or use '*' in these fields (for "any").
# Notice that tasks will be started based on the cron's system
# daemon's notion of time and timezones.
# Output of the crontab jobs (including errors) is sent through
# email to the user the crontab file belongs to (unless redirected).
# For example, you can run a backup of all your user accounts
# at 5 a.m every week with:
# 0 5 * * 1 tar -zcf /var/backups/home.tgz /home/
# For more information see the manual pages of crontab(5) and cron(8)
# m h  dom mon dow   command`;
        } else if (args.includes('-e')) {
          output = 'crontab: would open editor (simulated)';
        } else {
          output = 'crontab: invalid option';
        }
        break;
        
      case 'at':
        if (args.length === 0) {
          output = 'at: missing time specification';
        } else {
          output = `at: ${args.join(' ')} - Job scheduled (simulated)`;
        }
        break;
        
      case 'nohup':
        if (args.length === 0) {
          output = 'nohup: missing command';
        } else {
          output = `nohup: ${args.join(' ')} - Command would run immune to hangups (simulated)`;
        }
        break;
        
      case 'screen':
      case 'tmux':
        output = `${cmd}: Terminal multiplexer would start here (simulated)`;
        break;
        
      case 'rsync':
        if (args.length < 2) {
          output = `${cmd}: missing source and destination`;
        } else {
          output = `${cmd}: ${args.join(' ')} - Files would be synced (simulated)`;
        }
        break;
        
      case 'scp':
        if (args.length < 2) {
          output = 'scp: missing source and destination';
        } else {
          output = `scp: ${args.join(' ')} - Files would be copied securely (simulated)`;
        }
        break;
        
      case 'sftp':
      case 'ftp':
        if (args.length === 0) {
          output = `${cmd}: missing hostname`;
        } else {
          output = `${cmd}: ${args[0]} - FTP connection would be established (simulated)`;
        }
        break;
        
      case 'telnet':
        if (args.length === 0) {
          output = 'telnet: missing hostname';
        } else {
          output = `telnet: ${args[0]} - Telnet connection would be established (simulated)`;
        }
        break;
        
      case 'nslookup':
      case 'dig':
      case 'host':
        if (args.length === 0) {
          output = `${cmd}: missing hostname`;
        } else {
          output = `${cmd}: ${args[0]} - DNS lookup would be performed (simulated)`;
        }
        break;
        
      case 'traceroute':
        if (args.length === 0) {
          output = 'traceroute: missing hostname';
        } else {
          output = `traceroute to ${args[0]} (192.168.1.1), 30 hops max, 60 byte packets
 1  gateway (192.168.1.1)  1.234 ms  1.567 ms  1.890 ms
 2  * * *
 3  * * *`;
        }
        break;
        
      case 'nmap':
        if (args.length === 0) {
          output = 'nmap: missing target';
        } else {
          output = `nmap: ${args[0]} - Network scan would be performed (simulated)`;
        }
        break;
        
      case 'tcpdump':
      case 'wireshark':
        output = `${cmd}: Packet capture would start here (simulated)`;
        break;
        
      case 'apache2':
      case 'nginx':
        output = `${cmd}: Web server command would be executed here (simulated)`;
        break;
        
      case 'mysql':
        if (args.length === 0) {
          output = `Welcome to the MySQL monitor.  Commands end with ; or \\g.
Type 'help;' or '\\h' for help. Type '\\c' to clear the current input statement.
mysql>`;
        } else {
          output = `mysql: ${args.join(' ')} - MySQL command would be executed (simulated)`;
        }
        break;
        
      case 'postgresql':
      case 'redis':
      case 'mongodb':
        output = `${cmd}: Database command would be executed (simulated)`;
        break;
        
      case 'docker':
        if (args.length === 0) {
          output = `Usage:  docker [OPTIONS] COMMAND
A self-sufficient runtime for containers
Options:
      --config string      Location of client config files (default "~/.docker")
  -c, --context string     Name of the context to use to connect to the daemon (overrides DOCKER_HOST env var and default context set with "docker context use")
  -D, --debug              Enable debug mode
  -H, --host list          Daemon socket(s) to connect to
  -l, --log-level string   Set the logging level ("debug"|"info"|"warn"|"error"|"fatal") (default "info")
      --tls                Use TLS; implied by --tlsverify
      --tlsverify          Use TLS and verify the remote`;
        } else {
          output = `docker: ${args.join(' ')} - Docker command would be executed (simulated)`;
        }
        break;
        
      case 'kubectl':
        if (args.length === 0) {
          output = `kubectl controls the Kubernetes cluster manager.
Find more information at: https://kubernetes.io/docs/reference/kubectl/overview/
Basic Commands (Beginner):
  create        Create a resource from a file or from stdin.
  expose        Take a replication controller, service, deployment or pod and expose it externally
  run           Run a particular image on the cluster
  set           Set specific features on objects`;
        } else {
          output = `kubectl: ${args.join(' ')} - Kubernetes command would be executed (simulated)`;
        }
        break;
        
      case 'ansible':
      case 'puppet':
      case 'chef':
      case 'salt':
        output = `${cmd}: Automation command would be executed (simulated)`;
        break;
        
      case 'vagrant':
      case 'virtualbox':
      case 'vmware':
      case 'qemu':
      case 'kvm':
      case 'xen':
        output = `${cmd}: Virtual machine command would be executed (simulated)`;
        break;
        
      case 'openstack':
      case 'aws':
      case 'azure':
      case 'gcloud':
        output = `${cmd}: Cloud platform command would be executed (simulated)`;
        break;
        
      case 'kubernetes':
      case 'helm':
      case 'istio':
      case 'prometheus':
      case 'grafana':
      case 'elk':
      case 'fluentd':
      case 'jaeger':
        output = `${cmd}: DevOps tool command would be executed (simulated)`;
        break;
        
      case 'zip':
      case 'unzip':
      case 'rar':
      case 'unrar':
      case '7z':
        if (args.length === 0) {
          output = `${cmd}: missing file operand`;
        } else {
          output = `${cmd}: ${args.join(' ')} - Archive operation would be performed (simulated)`;
        }
        break;
        
      case 'sha256sum':
      case 'md5sum':
        if (args.length === 0) {
          output = `${cmd}: missing file operand`;
        } else {
          output = `${args[0]}  ${args[0]}`;
        }
        break;
        
      case 'gpg':
      case 'openssl':
      case 'ssh-keygen':
        output = `${cmd}: Security tool command would be executed (simulated)`;
        break;
        
      case 'dd':
        if (args.length < 2) {
          output = 'dd: missing operands';
        } else {
          output = `dd: ${args.join(' ')} - Disk operation would be performed (simulated)`;
        }
        break;
        
      case 'shred':
      case 'wipe':
        if (args.length === 0) {
          output = `${cmd}: missing file operand`;
        } else {
          output = `${cmd}: ${args[0]} - Secure delete would be performed (simulated)`;
        }
        break;
        
      case 'cryptsetup':
        output = 'cryptsetup: Encryption setup would be performed (simulated)';
        break;
        
      case 'lvm':
      case 'raid':
        output = `${cmd}: Storage management command would be executed (simulated)`;
        break;
        
      case 'btrfs':
      case 'ext4':
      case 'xfs':
      case 'zfs':
        output = `${cmd}: Filesystem command would be executed (simulated)`;
        break;
        
      default:
        if (cmd) {
          output = `${cmd}: command not found`;
        }
        break;
    }
    
    return output;
  }, [currentDirectory, fileSystem, user, hostname, systemInfo, terminalHistory]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim() === '') return;
    
    const output = executeCommand(currentCommand);
    const newHistory = [
      ...terminalHistory,
      `${user}@${hostname}:${currentDirectory}$ ${currentCommand}`,
      output,
      `${user}@${hostname}:${currentDirectory}$ `
    ].filter(Boolean) as string[];
    
    setTerminalHistory(newHistory);
    setCurrentCommand('');
    
    // Auto scroll to bottom
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Virtual Linux System</h2>
        <p className="text-white/60">Complete Linux terminal with 100+ Unix commands</p>
      </div>

      {/* System Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="glass-dark border-white/10">
          <CardContent className="p-3 text-center">
            <Cpu className="h-5 w-5 text-blue-400 mx-auto mb-1" />
            <div className="text-sm font-bold text-white">{systemInfo.loadAverage[0].toFixed(1)}</div>
            <div className="text-xs text-white/60">CPU Load</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/10">
          <CardContent className="p-3 text-center">
            <HardDrive className="h-5 w-5 text-green-400 mx-auto mb-1" />
            <div className="text-sm font-bold text-white">{Math.round((systemInfo.memory.used / systemInfo.memory.total) * 100)}%</div>
            <div className="text-xs text-white/60">Memory</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/10">
          <CardContent className="p-3 text-center">
            <Database className="h-5 w-5 text-purple-400 mx-auto mb-1" />
            <div className="text-sm font-bold text-white">{Math.round((systemInfo.disk.used / systemInfo.disk.total) * 100)}%</div>
            <div className="text-xs text-white/60">Disk</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/10">
          <CardContent className="p-3 text-center">
            <Network className="h-5 w-5 text-orange-400 mx-auto mb-1" />
            <div className="text-sm font-bold text-white">192.168.1.100</div>
            <div className="text-xs text-white/60">IP Address</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/10">
          <CardContent className="p-3 text-center">
            <Users className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <div className="text-sm font-bold text-white">{systemInfo.users}</div>
            <div className="text-xs text-white/60">Users</div>
          </CardContent>
        </Card>
        <Card className="glass-dark border-white/10">
          <CardContent className="p-3 text-center">
            <Terminal className="h-5 w-5 text-red-400 mx-auto mb-1" />
            <div className="text-sm font-bold text-white">{processes.length}</div>
            <div className="text-xs text-white/60">Processes</div>
          </CardContent>
        </Card>
      </div>

      {/* Terminal */}
      <Card className="glass-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Linux Terminal - {user}@{hostname}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black rounded-lg p-4 font-mono text-sm">
            <div
              ref={terminalRef}
              className="h-96 overflow-y-auto mb-4 text-green-400"
            >
              {terminalHistory.map((line, index) => (
                <div key={index} className={line.includes('$') ? 'text-white' : ''}>
                  {line}
                </div>
              ))}
            </div>
            <form onSubmit={handleCommandSubmit} className="flex items-center gap-2">
              <span className="text-white">{user}@{hostname}:{currentDirectory}$</span>
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-white"
                autoFocus
              />
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Command Categories */}
      <Card className="glass-dark border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Available Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-2">File System</h4>
              <div className="text-xs text-white/60 space-y-1">
                <div>ls, cd, pwd, mkdir, touch, cat</div>
                <div>cp, mv, rm, chmod, chown, find</div>
                <div>df, du, mount, umount, fsck</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-400 mb-2">Process Management</h4>
              <div className="text-xs text-white/60 space-y-1">
                <div>ps, top, kill, jobs, bg, fg</div>
                <div>nohup, screen, tmux, systemctl</div>
                <div>journalctl, dmesg, lsof</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-2">Network</h4>
              <div className="text-xs text-white/60 space-y-1">
                <div>ping, traceroute, nslookup, dig</div>
                <div>netstat, ss, ip, ifconfig</div>
                <div>ssh, scp, sftp, wget, curl</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-orange-400 mb-2">Development</h4>
              <div className="text-xs text-white/60 space-y-1">
                <div>gcc, make, python, node, java</div>
                <div>git, npm, pip, apt, yum</div>
                <div>docker, kubectl, ansible</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-400 mb-2">System Info</h4>
              <div className="text-xs text-white/60 space-y-1">
                <div>uname, uptime, free, whoami</div>
                <div>id, date, history, which</div>
                <div>env, printenv, export</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-cyan-400 mb-2">Text Processing</h4>
              <div className="text-xs text-white/60 space-y-1">
                <div>grep, sed, awk, sort, uniq</div>
                <div>wc, head, tail, cut, tr</div>
                <div>nano, vim, emacs, diff</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-yellow-400 mb-2">Archives</h4>
              <div className="text-xs text-white/60 space-y-1">
                <div>tar, gzip, gunzip, zip, unzip</div>
                <div>rar, unrar, 7z, compress</div>
                <div>sha256sum, md5sum, gpg</div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-pink-400 mb-2">Security</h4>
              <div className="text-xs text-white/60 space-y-1">
                <div>ssh-keygen, openssl, passwd</div>
                <div>sudo, su, chmod, chown</div>
                <div>firewall-cmd, iptables, selinux</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
