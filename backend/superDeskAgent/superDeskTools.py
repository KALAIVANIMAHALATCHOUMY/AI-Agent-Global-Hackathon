from strands import Agent, tool
import subprocess, platform, psutil, os, datetime
import cv2

@tool
def check_network() -> str:
    """
    Check the device's internet connectivity status.

    Use this tool when you need to verify whether the device has an active internet
    connection, such as before initiating online operations or troubleshooting network
    issues. It performs a simple ping to Google's DNS server (8.8.8.8) to determine
    connectivity.

    This tool is lightweight and ideal for quick network diagnostics, providing a clear
    indication of online status for immediate decision-making.

    Example response:
        "✅ Internet connection is active."
        OR
        "❌ No internet connectivity detected."

    Notes:
        - Relies on the `ping` command, which may be blocked by firewalls or network
          restrictions.
        - Only checks connectivity to 8.8.8.8; it does not guarantee access to all
          internet services.
        - Errors (e.g., command not found) are returned as error messages.

    Args:
        None

    Returns:
        A string indicating the network status, either confirming connectivity with
        "✅ Internet connection is active." or reporting an issue with
        "❌ No internet connectivity detected." or an error message if the check fails.
    """
    try:
        response = subprocess.run(["ping", "-n", "2", "8.8.8.8"], capture_output=True, text=True)
        if "TTL=" in response.stdout:
            return "✅ Internet connection is active."
        else:
            return "❌ No internet connectivity detected."
    except Exception as e:
        return f"Error checking network: {str(e)}"


@tool
def check_camera() -> str:
    """
    Verify the availability and functionality of the device's camera.

    Use this tool when you need to confirm whether a camera is connected and accessible,
    such as before starting a video call or initiating computer vision tasks. It attempts
    to open the default camera (index 0) and checks its status.

    This tool provides a quick diagnostic for camera hardware, ensuring it is not in use
    by another application or malfunctioning.

    Example response:
        "✅ Camera detected and working."
        OR
        "❌ Camera not detected or in use by another app."

    Notes:
        - Checks only the default camera (index 0); additional cameras require separate
          index specification.
        - May fail if camera permissions are denied or if OpenCV is not properly
          configured.
        - Does not capture or process video frames, only verifies accessibility.

    Args:
        None

    Returns:
        A string indicating the camera status, either "✅ Camera detected and working."
        or "❌ Camera not detected or in use by another app."
    """
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        return "❌ Camera not detected or in use by another app."
    else:
        cap.release()
        return "✅ Camera detected and working."
    

@tool
def get_recent_logs() -> str:
    """
    Retrieve the most recent system log entries from the device.

    Use this tool when you need to investigate recent system events or errors, such as
    troubleshooting crashes or monitoring system activity. It fetches the last 5 system
    log entries on Windows devices.

    This tool leverages the Windows Event Viewer (`wevtutil`) to provide a snapshot of
    recent system logs, useful for diagnosing issues in a Windows environment.

    Example response:
        "Event[0]:\n   Log Name: System\n   Source: ... (truncated log content)"
        OR
        "Log fetching supported for Windows currently."

    Notes:
        - Currently supports only Windows platforms; other operating systems return a
          message indicating limited support.
        - Returns the first 5 events; use a different tool for more extensive log
          analysis.
        - Requires administrative privileges on some systems to access full log data.

    Args:
        None

    Returns:
        A string containing the recent system log entries (up to 5) on Windows, or a
        message indicating platform limitation if not Windows.
    """
    if platform.system() == "Windows":
        logs = os.popen('wevtutil qe System /c:5 /f:text').read()
        return logs or "No logs found."
    return "Log fetching supported for Windows currently."


@tool
def system_health_summary() -> str:
    """
    Generate a summary of the system's health and performance metrics.

    Use this tool when you need an overview of system status, including boot time, CPU,
    memory, and disk usage, for monitoring or diagnostic purposes. It provides a quick
    health check suitable for system administrators or users troubleshooting performance.

    This tool collects real-time data using the `psutil` library, offering a concise
    report of key system metrics.

    Example response:
        "🖥️ **System Summary**\n- OS: Windows 10\n- Boot Time: 2025-10-16 14:00:00\n- CPU Usage: 15%\n- Memory Usage: 45%\n- Disk Usage: 70%"

    Notes:
        - CPU usage is measured over a 1-second interval, which may vary slightly.
        - Disk usage is reported for the root filesystem (`/`) only.
        - Requires `psutil` to be installed and functional; errors may occur on
          unsupported platforms.

    Args:
        None

    Returns:
        A formatted string containing system health details, including OS version,
        boot time, CPU usage percentage, memory usage percentage, and disk usage
        percentage.
    """
    boot_time = datetime.datetime.fromtimestamp(psutil.boot_time()).strftime("%Y-%m-%d %H:%M:%S")
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory().percent
    disk = psutil.disk_usage('/').percent
    return f"""🖥️ **System Summary**
- OS: {platform.system()} {platform.release()}
- Boot Time: {boot_time}
- CPU Usage: {cpu}%
- Memory Usage: {memory}%
- Disk Usage: {disk}%"""


@tool
def check_battery_status() -> str:
    """
    Check the current battery level and charging status of the device.

    Use this tool when you need to monitor battery health, especially on laptops or
    portable devices, to plan usage or troubleshoot power issues. It provides real-time
    battery percentage and charging state.

    This tool uses `psutil` to access battery information, making it suitable for devices
    with battery support.

    Example response:
        "Battery: 75% (Charging)"
        OR
        "🔋 No battery information available."

    Notes:
        - Returns "No battery information available" if the device lacks a battery
          (e.g., desktops) or if sensors are unsupported.
        - Charging status may not update in real-time on some hardware.
        - Requires `psutil` with battery sensor support.

    Args:
        None

    Returns:
        A string reporting the battery percentage and status (e.g., "Battery: 75%
        (Charging)") or a message if no battery data is available.
    """
    battery = psutil.sensors_battery()
    if not battery:
        return "🔋 No battery information available."
    status = "Charging" if battery.power_plugged else "Discharging"
    return f"Battery: {battery.percent}% ({status})"


@tool
def wifi_signal_details() -> str:
    """
    Retrieve detailed information about the active Wi-Fi connection.

    Use this tool when you need comprehensive details about the current Wi-Fi network,
    such as signal strength, SSID, and data rates, for troubleshooting or network
    optimization. It is ideal for diagnosing connectivity issues on Windows devices.

    This tool executes a PowerShell command to fetch Wi-Fi interface data, providing a
    detailed report of the active connection.

    Example response:
        "📡 Wi-Fi Details:\nSSID : MyNetwork\nSignal : 75%\nReceive rate : 72.2 Mbps\nTransmit rate : 72.2 Mbps"
        OR
        "No Wi-Fi connected."

    Notes:
        - Supported only on Windows due to reliance on `netsh` and PowerShell.
        - Requires an active Wi-Fi connection to return meaningful data.
        - May fail if PowerShell execution is restricted or if no Wi-Fi adapter is
          present.

    Args:
        None

    Returns:
        A string containing Wi-Fi details (SSID, signal strength, data rates) or a
        message if no connection is detected or an error occurs.
    """
    cmd = [
        "powershell",
        "-Command",
        """
        try {
            $wifi = netsh wlan show interfaces | Select-String 'SSID','Signal','Receive rate','Transmit rate'
            if ($wifi) { $wifi } else { 'No Wi-Fi connected.' }
        } catch { 'Error retrieving Wi-Fi info.' }
        """
    ]
    output = subprocess.check_output(cmd, text=True, encoding="utf-8", errors="ignore")
    return f"📡 Wi-Fi Details:\n{output.strip()}"


@tool
def wifi_signal_strength() -> str:
    """
    Check the signal strength of the active Wi-Fi connection.

    Use this tool when you need a quick assessment of Wi-Fi signal quality, such as
    diagnosing weak connections or optimizing network placement. It focuses solely on
    the signal percentage for rapid feedback.

    This tool uses PowerShell to extract the signal strength from the Wi-Fi interface
    on Windows devices.

    Example response:
        "📶 Wi-Fi Signal Strength: Signal : 75%"
        OR
        "No active Wi-Fi connection detected."

    Notes:
        - Available only on Windows due to dependency on `netsh` and PowerShell.
        - Requires an active Wi-Fi connection; otherwise, it returns a no-connection
          message.
        - Signal strength is reported as a percentage based on the adapter's reading.

    Args:
        None

    Returns:
        A string with the Wi-Fi signal strength (e.g., "📶 Wi-Fi Signal Strength:
        Signal : 75%") or a message if no connection is detected or an error occurs.
    """
    try:
        cmd = [
            "powershell",
            "-Command",
            """
            try {
                $wifi = netsh wlan show interfaces | Select-String 'Signal'
                if ($wifi) {
                    $wifi.ToString()
                } else {
                    'No active Wi-Fi connection detected.'
                }
            } catch {
                'Error retrieving Wi-Fi signal.'
            }
            """
        ]
        output = subprocess.check_output(cmd, text=True, encoding="utf-8", errors="ignore").strip()
        return f"📶 Wi-Fi Signal Strength: {output}"
    except Exception as e:
        return f"⚠️ Error: {str(e)}"
    

@tool
def dns_latency_check() -> str:
    """
    Measure the latency of DNS requests by pinging a public DNS server.

    Use this tool when you need to assess network responsiveness or troubleshoot slow
    internet performance, particularly related to DNS resolution. It pings Google's
    DNS (8.8.8.8) to estimate latency.

    This tool provides a detailed ping report, including response times, which can help
    identify network delays.

    Example response:
        "🌐 DNS Latency Report:\nPinging 8.8.8.8 with 32 bytes of data:\nReply from 8.8.8.8: time=25ms..."

    Notes:
        - Uses 4 ping attempts to Google's DNS (8.8.8.8) for consistency.
        - May be affected by firewalls or network restrictions blocking ping requests.
        - Does not test other DNS servers; use a different tool for multi-server checks.

    Args:
        None

    Returns:
        A string containing the ping output, including latency details for DNS requests
        or an error if the command fails.
    """
    import subprocess
    result = subprocess.run(["ping", "8.8.8.8", "-n", "4"], capture_output=True, text=True)
    return f"🌐 DNS Latency Report:\n{result.stdout}"


@tool
def disk_smart_status() -> str:
    """
    Check the health status of the system's disk drives using SMART data.

    Use this tool when you need to assess disk health or predict potential failures,
    especially for proactive maintenance. It retrieves model and status information
    for all disk drives on Windows systems.

    This tool uses PowerShell and WMI to access SMART (Self-Monitoring, Analysis, and
    Reporting Technology) data, providing a basic health overview.

    Example response:
        "💽 Disk Health:\nModel : ST1000DM003-1ER162  Status : OK"
        OR
        "Error checking disk SMART status: [error message]"

    Notes:
        - Supported only on Windows due to dependency on WMI and PowerShell.
        - Provides basic status; detailed SMART attributes require specialized tools.
        - May fail if WMI services are disabled or if no disk data is accessible.

    Args:
        None

    Returns:
        A string containing disk model and status information or an error message if
        the check fails.
    """
    try:
        cmd = ['powershell', '-Command', "Get-WmiObject Win32_DiskDrive | Select-Object Model,Status"]
        output = subprocess.check_output(cmd, text=True)
        return f"💽 Disk Health:\n{output.strip()}"
    except Exception as e:
        return f"Error checking disk SMART status: {e}"
    

@tool
def list_audio_devices() -> str:
    """
    Retrieve a list of installed audio devices on the system.

    Use this tool when you need to identify available sound devices, such as speakers
    or microphones, for troubleshooting audio issues or configuring multimedia
    applications. It is designed for Windows environments.

    This tool uses PowerShell and WMI to fetch audio device names, providing a simple
    inventory of sound hardware.

    Example response:
        "🔊 Audio Devices:\nRealtek High Definition Audio\nUSB Audio Device"
        OR
        "Error listing audio devices: [error message]"

    Notes:
        - Supported only on Windows due to reliance on WMI and PowerShell.
        - Returns only device names; detailed properties require additional tools.
        - May fail if WMI access is restricted or no audio devices are detected.

    Args:
        None

    Returns:
        A string listing the names of installed audio devices or an error message if
        the command fails.
    """
    try:
        cmd = ['powershell', '-Command', "Get-CimInstance Win32_SoundDevice | Select-Object -ExpandProperty Name"]
        output = subprocess.check_output(cmd, text=True)
        return f"🔊 Audio Devices:\n{output.strip()}"
    except Exception as e:
        return f"Error listing audio devices: {e}"
    
@tool
def list_installed_apps() -> str:
    """
    List installed applications on the system from the Windows registry.

    Use this tool when you need to inventory installed software, detect unwanted
    programs, or troubleshoot application-related issues. It is tailored for Windows
    environments.

    This tool queries the Windows registry using PowerShell to retrieve application
    names, providing a truncated list for quick review.

    Example response:
        "📦 Installed Apps:\nMicrosoft Edge\nGoogle Chrome\n... (up to 1500 characters)"
        OR
        "Error listing installed apps: [error message]"

    Notes:
        - Supported only on Windows due to registry-based data retrieval.
        - Output is limited to 1500 characters; use a system tool for full details.
        - May require administrative privileges to access all registry entries.

    Args:
        None

    Returns:
        A string containing a truncated list of installed application names or an
        error message if the command fails.
    """
    try:
        cmd = [
            "powershell",
            "-Command",
            "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | "
            "Select-Object DisplayName | Format-Table -HideTableHeaders"
        ]
        output = subprocess.check_output(cmd, text=True, encoding='utf-8', errors='ignore')
        return f"📦 Installed Apps:\n{output[:1500]}..."
    except Exception as e:
        return f"Error listing installed apps: {e}"
    

@tool
def check_windows_update() -> str:
    """
    Retrieve information about installed Windows updates.

    Use this tool when you need to verify the update history or check for recent
    security patches on a Windows system, aiding in compliance or troubleshooting
    update-related issues.

    This tool uses PowerShell to query the Windows Update log, providing details
    about installed hotfixes.

    Example response:
        "🪟 Windows Updates:\nDescription : Security Update\nHotFixID : KB1234567\nInstalledOn : 10/15/2025"
        OR
        "Error checking Windows updates: [error message]"

    Notes:
        - Supported only on Windows due to dependency on PowerShell and Windows
          Update infrastructure.
        - Returns all installed updates; no filtering by date or type is applied.
        - May fail if PowerShell execution is restricted or update data is
          inaccessible.

    Args:
        None

    Returns:
        A string containing a list of installed Windows updates with description,
        hotfix ID, and installation date, or an error message if the command fails.
    """
    try:
        cmd = ['powershell', '-Command', "Get-HotFix | Select-Object -Property Description, HotFixID, InstalledOn"]
        output = subprocess.check_output(cmd, text=True)
        return f"🪟 Windows Updates:\n{output.strip()}"
    except Exception as e:
        return f"Error checking Windows updates: {e}"
    

@tool
def list_top_processes() -> str:
    """
    List the top 5 processes consuming the most CPU resources.

    Use this tool when you need to identify resource-intensive applications or
    troubleshoot system slowdowns. It provides a snapshot of the most active processes
    based on CPU usage.

    This tool uses `psutil` to monitor running processes and sorts them by CPU
    percentage, offering real-time insights into system performance.

    Example response:
        "notepad.exe (PID 1234) - 15.5% CPU\nchrome.exe (PID 5678) - 10.2% CPU\n..."

    Notes:
        - Lists only the top 5 processes; use a different tool for a full process
          list.
        - CPU percentage is measured over a brief interval and may fluctuate.
        - Requires `psutil` and may not work on all platforms if unsupported.

    Args:
        None

    Returns:
        A string listing the top 5 processes with their PID and CPU usage percentage,
        one per line.
    """
    processes = sorted(psutil.process_iter(['pid', 'name', 'cpu_percent']), 
                       key=lambda x: x.info['cpu_percent'], reverse=True)[:5]
    return "\n".join([f"{p.info['name']} (PID {p.info['pid']}) - {p.info['cpu_percent']}% CPU" for p in processes])


@tool
def check_defender_status() -> str:
    """
    Check the operational status of Windows Defender on the system.

    Use this tool when you need to verify that Windows Defender is active, ensuring
    basic antivirus protection is in place. It is useful for security audits or
    troubleshooting.

    This tool queries the Windows Service Control Manager to determine if the
    WinDefend service is running.

    Example response:
        "🛡️ Windows Defender is running."
        OR
        "⚠️ Windows Defender not active."

    Notes:
        - Supported only on Windows due to reliance on the WinDefend service.
        - Status reflects the service state but does not check real-time protection
          details.
        - May require administrative privileges for accurate status reporting.

    Args:
        None

    Returns:
        A string indicating whether Windows Defender is running ("🛡️ Windows Defender
        is running.") or not ("⚠️ Windows Defender not active.").
    """
    output = os.popen("sc query WinDefend").read()
    return "🛡️ Windows Defender is running." if "RUNNING" in output else "⚠️ Windows Defender not active."


@tool
def get_cpu_temp_windows() -> list:
    """
    Retrieve the current CPU temperature readings on a Windows system.

    Use this tool when you need to monitor CPU thermal conditions to prevent
    overheating or optimize performance on Windows devices. It is ideal for
    hardware diagnostics.

    This tool uses the WMI (Windows Management Instrumentation) interface to access
    thermal zone data, converting Kelvin readings to Celsius.

    Example response:
        [35.5, 36.2]  # List of temperatures in °C from multiple sensors
        OR
        "No temperature data available."

    Notes:
        - Supported only on Windows due to WMI dependency.
        - Returns a list of temperatures if multiple sensors are detected; a single
          value if one sensor is present.
        - May return "No temperature data available" if thermal sensors are
          unsupported or inaccessible.

    Args:
        None

    Returns:
        A list of floats representing CPU temperatures in Celsius, or a string
        ("No temperature data available.") if no data is found.
    """
    import wmi
    w = wmi.WMI(namespace="root\\wmi")
    temperature_info = w.MSAcpi_ThermalZoneTemperature()
    temps = []
    for sensor in temperature_info:
        # Temperature in Kelvin * 10
        temps.append((sensor.CurrentTemperature / 10.0) - 273.15)
    return temps if temps else "No temperature data available"

@tool
def check_missing_drivers():
    result = os.popen("driverquery /FO LIST /SI").read()
    if "Error" in result:
        return "Unable to fetch driver details."
    return f"🧩 Driver List:\n{result[:1000]}..."  # Trim for display


@tool
def check_gpu_status() -> str:
    """
    Check GPU details (name, memory, driver version) using WMI on Windows.
    Useful for verifying graphics hardware for ML, games, or rendering tasks.
    """
    try:
        cmd = [
            "powershell",
            "-Command",
            "Get-WmiObject Win32_VideoController | Select-Object Name, DriverVersion, AdapterRAM"
        ]
        output = subprocess.check_output(cmd, text=True)
        return f"🎮 GPU Details:\n{output.strip()}"
    except Exception as e:
        return f"Error checking GPU details: {e}"

@tool
def check_system_integrity() -> str:
    """
    Run Windows SFC (System File Checker) to detect and repair corrupted files.
    """
    try:
        result = subprocess.run(
            ["sfc", "/scannow"], capture_output=True, text=True, check=False
        )
        return f"🧩 System File Check:\n{result.stdout[:1500]}..."
    except Exception as e:
        return f"Error running integrity check: {e}"


@tool
def network_speed_test() -> str:
    """
    Perform an internet speed test (download/upload) using `speedtest-cli`.
    Requires `pip install speedtest-cli`.
    """
    try:
        import speedtest
        st = speedtest.Speedtest()
        st.download()
        st.upload()
        results = st.results.dict()
        return (f"🚀 Network Speed Test:\n"
                f"Download: {results['download'] / 1_000_000:.2f} Mbps\n"
                f"Upload: {results['upload'] / 1_000_000:.2f} Mbps\n"
                f"Ping: {results['ping']} ms")
    except Exception as e:
        return f"Error running network speed test: {e}"

@tool
def clear_temp_files() -> str:
    """
    Clean Windows temporary and cache directories to free up disk space.
    """
    try:
        temp_dir = os.getenv('TEMP')
        count = 0
        for root, dirs, files in os.walk(temp_dir):
            for f in files:
                try:
                    os.remove(os.path.join(root, f))
                    count += 1
                except:
                    pass
        return f"🧹 Cleared approximately {count} temporary files."
    except Exception as e:
        return f"Error cleaning temp files: {e}"


@tool
def list_top_memory_processes() -> str:
    """
    List the top 5 processes using the most memory.
    """
    processes = sorted(psutil.process_iter(['pid', 'name', 'memory_percent']),
                       key=lambda x: x.info['memory_percent'], reverse=True)[:5]
    return "\n".join([f"{p.info['name']} (PID {p.info['pid']}) - {p.info['memory_percent']:.2f}% RAM"
                      for p in processes])


@tool
def hardware_summary() -> str:
    """
    Generate a concise summary of CPU, GPU, and total memory.
    """
    try:
        cpu = platform.processor()
        ram = round(psutil.virtual_memory().total / (1024**3), 2)
        cmd = ['powershell', '-Command', "(Get-WmiObject Win32_VideoController).Name"]
        gpu = subprocess.check_output(cmd, text=True).strip()
        return f"🧱 Hardware Summary:\nCPU: {cpu}\nGPU: {gpu}\nMemory: {ram} GB"
    except Exception as e:
        return f"Error fetching hardware summary: {e}"
@tool
def system_uptime() -> str:
    """
    Display how long the system has been running since the last boot.
    """
    uptime_seconds = (datetime.datetime.now() - datetime.datetime.fromtimestamp(psutil.boot_time())).total_seconds()
    hours, remainder = divmod(uptime_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"⏱️ System Uptime: {int(hours)}h {int(minutes)}m {int(seconds)}s"



@tool
def run_all_diagnostics() -> str:
    """
    Execute a comprehensive set of diagnostic tools and compile a full system report.

    Use this tool when you need an all-in-one system health check, combining network,
    hardware, performance, storage, security, and configuration diagnostics. It is
    perfect for generating a detailed overview for troubleshooting or maintenance.

    This tool runs multiple diagnostic functions and formats their output into a
    structured report, covering connectivity, hardware status, system performance,
    storage, security, updates, and logs.

    Example response:
        "========================================\n🚀 SYSTEM DIAGNOSTIC REPORT\n========================================\n\n📡 NETWORK & CONNECTIVITY\n------------------------------\n✅ Internet connection is active.\n... (rest of report)"

    Notes:
        - Supported primarily on Windows due to dependencies on PowerShell, WMI, and
          Windows-specific commands.
        - Some tools (e.g., logs, drivers) are Windows-only; others may work
          cross-platform with limitations.
        - Output is lengthy; review each section for relevant details.

    Args:
        None

    Returns:
        A formatted string containing the complete diagnostic report, organized by
        categories (e.g., Network, Hardware, Performance), with results from all
        invoked tools.
    """
    print("=" * 60)
    print("🚀 SYSTEM DIAGNOSTIC REPORT")
    print("=" * 60)
    
    # Network and connectivity checks
    print("\n📡 NETWORK & CONNECTIVITY")
    print("-" * 30)
    print(check_network())
    print(wifi_signal_details())
    print(wifi_signal_strength())
    print(dns_latency_check())
    
    # Hardware checks
    print("\n🔧 HARDWARE STATUS")
    print("-" * 30)
    print(check_camera())
    print(check_battery_status())
    # print(check_temperature())
    # print(get_cpu_temp_windows())

    print(list_audio_devices())
    
    # System performance
    print("\n⚡ SYSTEM PERFORMANCE")
    print("-" * 30)
    print(system_health_summary())
    print("\n🔥 Top CPU Processes:")
    print(list_top_processes())
    
    # Storage and drivers
    print("\n💾 STORAGE & DRIVERS")
    print("-" * 30)
    print(disk_smart_status())
    print(check_missing_drivers())
    
    # Security and updates
    print("\n🔒 SECURITY & UPDATES")
    print("-" * 30)
    print(check_defender_status())
    print("\n🔄 Windows Updates:")
    print(check_windows_update())
    
    # System configuration
    print("\n⚙️ SYSTEM CONFIGURATION")
    print("-" * 30)
    # print(get_startup_programs())
    print(list_installed_apps())
    
    # System logs
    print("\n📋 RECENT SYSTEM LOGS")
    print("-" * 30)
    print(get_recent_logs())
    
    print("\n" + "=" * 60)
    print("✅ DIAGNOSTIC REPORT COMPLETE")
    print("=" * 60)

    print("\n🔧 EXTENDED SYSTEM INFO")
    print("-" * 30)
    print(hardware_summary())
    print(system_uptime())
    print(check_gpu_status())
    print(list_top_memory_processes())
    print(network_speed_test())
    
# run_all_diagnostics()

