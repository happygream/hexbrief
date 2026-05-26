; ================================================================
; HexBrief Custom NSIS Installer — Full branded UI, no MUI2
; sharedHeader already provides: Unicode, Name, BrandingText, common.nsh,
; x64.nsh, WinVer.nsh, StdUtils, plugin dirs, language macros
; ================================================================

!include "nsDialogs.nsh"

ShowInstDetails nevershow
ShowUninstDetails nevershow
Caption "HexBrief Setup"
InstallDir "$LOCALAPPDATA\Programs\HexBrief"

; ── Variables ────────────────────────────────────────────────────
Var hDialog
Var hProgressBar
Var hLogLabel
Var hCheckLaunch
Var hCheckDesktop
Var hCheckStartMenu
Var hDirRequest
Var InstDir_
Var DesktopShortcut_
Var StartMenuShortcut_
Var appExe

; ── Pages ────────────────────────────────────────────────────────
Page custom pg_Welcome_Show pg_Welcome_Leave
Page custom pg_Options_Show pg_Options_Leave
Page custom pg_Install_Show pg_Install_Leave
Page instfiles "" "" pg_InstFiles_Pre  ; hidden — sections must exist for NSIS
Page custom pg_Finish_Show

UninstPage custom un.Confirm_Show un.Confirm_Leave
UninstPage instfiles "" "" un.InstFiles_Pre
UninstPage custom un.Progress_Show un.Progress_Leave

; ================================================================
; SHARED: Draw sidebar (called on every page)
; Pass drag handler name as parameter:
;   installer pages: OnTitlebarDrag
;   uninstaller pages: un.OnTitlebarDrag
; ================================================================
!macro HB_Sidebar dragHandler
  ${NSD_CreateBitmap} 0 0 160u 100%u ""
  Pop $0
  ${NSD_SetImage} $0 "${BUILD_RESOURCES_DIR}\installerSidebar.bmp" $1

  ; Red top bar
  ${NSD_CreateLabel} 0 0 160u 3u ""
  Pop $0
  SetCtlColors $0 "" "0xe8412a"

  ; Red right edge
  ${NSD_CreateLabel} 157u 0 3u 100%u ""
  Pop $0
  SetCtlColors $0 "" "0xe8412a"

  ; Dark divider next to edge
  ${NSD_CreateLabel} 154u 0 3u 100%u ""
  Pop $0
  SetCtlColors $0 "" "0x0f1629"

  ; Custom titlebar strip across top of content area
  ${NSD_CreateLabel} 160u 0 340u 22u ""
  Pop $0
  SetCtlColors $0 "" "0x0a0f1e"

  ; App name in titlebar
  ${NSD_CreateLabel} 168u 5u 220u 14u "HexBrief Setup"
  Pop $0
  SetCtlColors $0 "0x6070a8" "0x0a0f1e"
  CreateFont $R9 "JetBrains Mono" 8 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ; Drag handle — covers titlebar, click triggers window drag
  ${NSD_CreateLabel} 160u 0 280u 22u ""
  Pop $R8
  SetCtlColors $R8 "0x0a0f1e" "0x0a0f1e"
  ${NSD_OnClick} $R8 ${dragHandler}
!macroend

; ================================================================
; SHARED: Dark header bar (top of content area)
; $R0 = title, $R1 = subtitle, $R2 = accent colour (0=red, 1=green)
; ================================================================
!macro HB_Header title subtitle accentcol
  ${NSD_CreateLabel} 160u 22u 340u 34u ""
  Pop $0
  SetCtlColors $0 "" "0x0a0f1e"

  ${NSD_CreateLabel} 172u 28u 300u 16u "${title}"
  Pop $0
  SetCtlColors $0 "0xf0f2f8" "0x0a0f1e"
  CreateFont $R9 "DM Sans" 11 700
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 172u 46u 300u 12u "${subtitle}"
  Pop $0
  SetCtlColors $0 "0x6070a8" "0x0a0f1e"
  CreateFont $R9 "Courier New" 8 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  !if "${accentcol}" == "green"
    ${NSD_CreateLabel} 160u 58u 340u 3u ""
    Pop $0
    SetCtlColors $0 "" "0x4caf50"
  !else
    ${NSD_CreateLabel} 160u 58u 340u 3u ""
    Pop $0
    SetCtlColors $0 "" "0xe8412a"
  !endif
!macroend

; ================================================================
; SHARED: Step progress dots
; ================================================================
!macro HB_Dots active
  ${NSD_CreateLabel} 255u 278u 8u 5u ""
  Pop $0
  !if "${active}" == "1"
    SetCtlColors $0 "" "0xe8412a"
  !else
    SetCtlColors $0 "" "0x2e3a60"
  !endif

  ${NSD_CreateLabel} 267u 278u 6u 5u ""
  Pop $0
  !if "${active}" == "2"
    SetCtlColors $0 "" "0xe8412a"
  !else
    SetCtlColors $0 "" "0x2e3a60"
  !endif

  ${NSD_CreateLabel} 277u 278u 6u 5u ""
  Pop $0
  !if "${active}" == "3"
    SetCtlColors $0 "" "0xe8412a"
  !else
    SetCtlColors $0 "" "0x2e3a60"
  !endif

  ${NSD_CreateLabel} 287u 278u 6u 5u ""
  Pop $0
  !if "${active}" == "4"
    SetCtlColors $0 "" "0xe8412a"
  !else
    SetCtlColors $0 "" "0x2e3a60"
  !endif
!macroend

; ================================================================
; PAGE 1: WELCOME
; ================================================================
Function pg_Welcome_Show
  nsDialogs::Create 1018
  Pop $hDialog
  SetCtlColors $hDialog "" "0x161e35"

  !insertmacro HB_Sidebar OnTitlebarDrag
  !insertmacro HB_Header "Welcome to HexBrief" "Personal morning dashboard installer" "red"
  !insertmacro HB_Dots "1"

  ${NSD_CreateLabel} 172u 66u 298u 16u "HexBrief is your personal morning dashboard."
  Pop $0
  SetCtlColors $0 "0xf0f2f8" "0x161e35"
  CreateFont $R9 "DM Sans" 10 500
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 172u 86u 298u 32u "Weather, tasks, headlines and calendar in one place. No accounts. No tracking. No subscriptions."
  Pop $0
  SetCtlColors $0 "0x9aa5c8" "0x161e35"
  CreateFont $R9 "DM Sans" 9 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 172u 122u 298u 14u "Click Next to continue."
  Pop $0
  SetCtlColors $0 "0x6070a8" "0x161e35"
  CreateFont $R9 "DM Sans" 9 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  nsDialogs::Show
FunctionEnd

Function pg_Welcome_Leave
FunctionEnd

; ================================================================
; PAGE 2: OPTIONS
; ================================================================
Function pg_Options_Show
  nsDialogs::Create 1018
  Pop $hDialog
  SetCtlColors $hDialog "" "0x161e35"

  !insertmacro HB_Sidebar OnTitlebarDrag
  !insertmacro HB_Header "Install location" "Choose where to install HexBrief" "red"
  !insertmacro HB_Dots "2"

  ${NSD_CreateLabel} 172u 66u 160u 12u "Destination folder:"
  Pop $0
  SetCtlColors $0 "0x6070a8" "0x161e35"
  CreateFont $R9 "Courier New" 8 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateDirRequest} 172u 80u 298u 16u "$InstDir_"
  Pop $hDirRequest
  SetCtlColors $hDirRequest "0xf0f2f8" "0x0f1629"
  CreateFont $R9 "Courier New" 9 400
  SendMessage $hDirRequest ${WM_SETFONT} $R9 0

  ${NSD_CreateCheckbox} 174u 106u 280u 15u "Create desktop shortcut"
  Pop $hCheckDesktop
  SetCtlColors $hCheckDesktop "0xf0f2f8" "0x161e35"
  ${NSD_SetState} $hCheckDesktop ${BST_CHECKED}

  ${NSD_CreateCheckbox} 174u 124u 280u 15u "Add to Start Menu"
  Pop $hCheckStartMenu
  SetCtlColors $hCheckStartMenu "0xf0f2f8" "0x161e35"
  ${NSD_SetState} $hCheckStartMenu ${BST_CHECKED}

  nsDialogs::Show
FunctionEnd

Function pg_Options_Leave
  ${NSD_GetText} $hDirRequest $InstDir_
  StrCpy $INSTDIR "$InstDir_"
  ${NSD_GetState} $hCheckDesktop $DesktopShortcut_
  ${NSD_GetState} $hCheckStartMenu $StartMenuShortcut_
FunctionEnd

; ================================================================
; PAGE 3: INSTALL
; ================================================================
Function pg_Install_Show
  nsDialogs::Create 1018
  Pop $hDialog
  SetCtlColors $hDialog "" "0x161e35"

  !insertmacro HB_Sidebar OnTitlebarDrag
  !insertmacro HB_Header "Installing..." "Please wait while files are extracted" "red"
  !insertmacro HB_Dots "3"

  ${NSD_CreateLabel} 172u 66u 200u 12u "Extracting application files:"
  Pop $0
  SetCtlColors $0 "0x6070a8" "0x161e35"
  CreateFont $R9 "Courier New" 8 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateProgressBar} 172u 81u 298u 14u ""
  Pop $hProgressBar
  SendMessage $hProgressBar ${PBM_SETRANGE} 0 0x640000
  SendMessage $hProgressBar ${PBM_SETPOS} 0 0

  ${NSD_CreateLabel} 172u 99u 298u 12u ""
  Pop $hLogLabel
  SetCtlColors $hLogLabel "0x6070a8" "0x161e35"
  CreateFont $R9 "Courier New" 8 400
  SendMessage $hLogLabel ${WM_SETFONT} $R9 0

  ; Terminal panel
  ${NSD_CreateLabel} 172u 116u 298u 58u ""
  Pop $0
  SetCtlColors $0 "" "0x0a0f1e"

  nsDialogs::Show

  ; ── Actual install ──────────────────────────────────────
  SetDetailsPrint none
  SetOutPath "$INSTDIR"
  InitPluginsDir

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Extracting files..."
  SendMessage $hProgressBar ${PBM_SETPOS} 15 0

  ; Copy the correct 7z package to plugins dir, then extract
  ; Guards handle three cases: combined (both), x64-only, ia32-only
  !ifdef APP_32
    !ifdef APP_64
      ; Combined build — detect arch at runtime
      System::Call "kernel32::IsWow64Process(i -1, *i .r0)"
      StrCmp $0 "1" hb_is64 hb_is32
      hb_is64:
        File /oname=$PLUGINSDIR\app.7z "${APP_64}"
        Goto hb_extract
      hb_is32:
        File /oname=$PLUGINSDIR\app.7z "${APP_32}"
      hb_extract:
    !else
      ; ia32-only build
      File /oname=$PLUGINSDIR\app.7z "${APP_32}"
    !endif
  !else
    ; x64-only build
    File /oname=$PLUGINSDIR\app.7z "${APP_64}"
  !endif
  Nsis7z::Extract "$PLUGINSDIR\app.7z"

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Creating shortcuts..."
  SendMessage $hProgressBar ${PBM_SETPOS} 55 0

  WriteUninstaller "$INSTDIR\Uninstall HexBrief.exe"
  StrCpy $appExe "$INSTDIR\HexBrief.exe"

  IntCmp $DesktopShortcut_ ${BST_CHECKED} 0 skip_desktop skip_desktop
    CreateShortcut "$DESKTOP\HexBrief.lnk" "$INSTDIR\HexBrief.exe"
  skip_desktop:

  IntCmp $StartMenuShortcut_ ${BST_CHECKED} 0 skip_startmenu skip_startmenu
    CreateDirectory "$SMPROGRAMS\HexBrief"
    CreateShortcut "$SMPROGRAMS\HexBrief\HexBrief.lnk" "$INSTDIR\HexBrief.exe"
    CreateShortcut "$SMPROGRAMS\HexBrief\Uninstall.lnk" "$INSTDIR\Uninstall HexBrief.exe"
  skip_startmenu:

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Writing registry entries..."
  SendMessage $hProgressBar ${PBM_SETPOS} 80 0

  WriteRegStr HKCU "Software\HexBrief" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\HexBrief" "Version" "${VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "DisplayName" "HexBrief"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "UninstallString" '"$INSTDIR\Uninstall HexBrief.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "Publisher" "HexBrief"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "DisplayIcon" "$INSTDIR\HexBrief.exe"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "EstimatedSize" ${ESTIMATED_SIZE}
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "NoRepair" 1

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Done."
  SendMessage $hProgressBar ${PBM_SETPOS} 100 0
FunctionEnd

Function pg_Install_Leave
FunctionEnd

; ================================================================
; PAGE 4: FINISH
; ================================================================
Function pg_Finish_Show
  nsDialogs::Create 1018
  Pop $hDialog
  SetCtlColors $hDialog "" "0x161e35"

  !insertmacro HB_Sidebar OnTitlebarDrag
  !insertmacro HB_Header "Installation complete" "HexBrief ${VERSION} is ready" "green"
  !insertmacro HB_Dots "4"

  ${NSD_CreateLabel} 220u 74u 240u 16u "Installed successfully."
  Pop $0
  SetCtlColors $0 "0xf0f2f8" "0x161e35"
  CreateFont $R9 "DM Sans" 11 500
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 210u 94u 260u 24u "Open it each morning for your daily brief."
  Pop $0
  SetCtlColors $0 "0x9aa5c8" "0x161e35"
  CreateFont $R9 "DM Sans" 9 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateCheckbox} 212u 124u 250u 15u "Launch HexBrief now"
  Pop $hCheckLaunch
  SetCtlColors $hCheckLaunch "0xf0f2f8" "0x161e35"
  ${NSD_SetState} $hCheckLaunch ${BST_CHECKED}

  nsDialogs::Show

  ${NSD_GetState} $hCheckLaunch $0
  IntCmp $0 ${BST_CHECKED} 0 skip_launch skip_launch
    Exec '"$INSTDIR\HexBrief.exe"'
  skip_launch:
FunctionEnd

; ================================================================
; UNINSTALLER: CONFIRM
; ================================================================
Function un.Confirm_Show
  nsDialogs::Create 1018
  Pop $hDialog
  SetCtlColors $hDialog "" "0x161e35"

  !insertmacro HB_Sidebar un.OnTitlebarDrag
  !insertmacro HB_Header "Uninstall HexBrief" "Remove HexBrief from your computer" "red"

  ${NSD_CreateLabel} 172u 66u 298u 32u "This will remove HexBrief and all its files, including your saved settings, tasks and preferences."
  Pop $0
  SetCtlColors $0 "0x9aa5c8" "0x161e35"
  CreateFont $R9 "DM Sans" 9 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 172u 104u 298u 14u "Click Uninstall to continue."
  Pop $0
  SetCtlColors $0 "0x6070a8" "0x161e35"

  nsDialogs::Show
FunctionEnd

Function un.Confirm_Leave
FunctionEnd

; ================================================================
; UNINSTALLER: PROGRESS
; ================================================================
Function un.Progress_Show
  nsDialogs::Create 1018
  Pop $hDialog
  SetCtlColors $hDialog "" "0x161e35"

  !insertmacro HB_Sidebar un.OnTitlebarDrag
  !insertmacro HB_Header "Removing HexBrief..." "Cleaning up files and registry entries" "red"

  ${NSD_CreateProgressBar} 172u 80u 298u 14u ""
  Pop $hProgressBar
  SendMessage $hProgressBar ${PBM_SETRANGE} 0 0x640000
  SendMessage $hProgressBar ${PBM_SETPOS} 0 0

  ${NSD_CreateLabel} 172u 99u 298u 12u ""
  Pop $hLogLabel
  SetCtlColors $hLogLabel "0x6070a8" "0x161e35"
  CreateFont $R9 "Courier New" 8 400
  SendMessage $hLogLabel ${WM_SETFONT} $R9 0

  nsDialogs::Show

  ; ── Actual uninstall ────────────────────────────────────
  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Closing HexBrief..."
  SendMessage $hProgressBar ${PBM_SETPOS} 10 0

  nsProcess::_FindProcess "HexBrief.exe"
  Pop $R0
  IntCmp $R0 0 0 skip_kill skip_kill
    nsProcess::_KillProcess "HexBrief.exe"
    Sleep 800
  skip_kill:

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Removing files..."
  SendMessage $hProgressBar ${PBM_SETPOS} 30 0
  RMDir /r "$INSTDIR"

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Removing app data..."
  SendMessage $hProgressBar ${PBM_SETPOS} 55 0
  RMDir /r "$APPDATA\HexBrief"
  RMDir /r "$LOCALAPPDATA\HexBrief"

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Removing shortcuts..."
  SendMessage $hProgressBar ${PBM_SETPOS} 75 0
  Delete "$DESKTOP\HexBrief.lnk"
  Delete "$SMPROGRAMS\HexBrief\HexBrief.lnk"
  Delete "$SMPROGRAMS\HexBrief\Uninstall.lnk"
  RMDir "$SMPROGRAMS\HexBrief"
  Delete "$SMSTARTUP\HexBrief.lnk"
  Delete "$QUICKLAUNCH\HexBrief.lnk"

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Cleaning registry..."
  SendMessage $hProgressBar ${PBM_SETPOS} 90 0
  DeleteRegKey HKCU "Software\HexBrief"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "HexBrief"

  SendMessage $hLogLabel ${WM_SETTEXT} 0 "STR:> Done."
  SendMessage $hProgressBar ${PBM_SETPOS} 100 0
FunctionEnd

Function un.Progress_Leave
FunctionEnd

; ================================================================
; DRAG HANDLER — makes frameless window draggable
; ================================================================
Function OnTitlebarDrag
  ; Release mouse capture, then tell Windows this is a caption drag
  System::Call "user32::ReleaseCapture()"
  ; WM_NCLBUTTONDOWN = 0xA1, HTCAPTION = 2
  SendMessage $HWNDPARENT 0xA1 2 0
FunctionEnd

Function un.OnTitlebarDrag
  System::Call "user32::ReleaseCapture()"
  SendMessage $HWNDPARENT 0xA1 2 0
FunctionEnd

; ================================================================
; INSTFILES PAGE SKIP — prevents blank progress window showing
; ================================================================
Function pg_InstFiles_Pre
  Abort
FunctionEnd

Function un.InstFiles_Pre
  Abort
FunctionEnd

; ================================================================
; SECTIONS — required by NSIS
; Install logic runs in pg_Install_Show page function above
; ================================================================
Section "-Install"
SectionEnd

Section "un.Uninstall"
SectionEnd

; ================================================================
; INIT
; ================================================================
Function .onInit
  StrCpy $InstDir_ "$LOCALAPPDATA\Programs\HexBrief"
  StrCpy $appExe "$INSTDIR\HexBrief.exe"
  System::Call "kernel32::IsWow64Process(i -1, *i .r0)"
  StrCmp $0 "1" 0 +2
    SetRegView 64
  ; During uninstaller build phase — write uninstaller and exit
  !ifdef BUILD_UNINSTALLER
    WriteUninstaller "${UNINSTALLER_OUT_FILE}"
    Quit
  !endif
FunctionEnd


Function .onGUIInit
  ; ── Remove standard Windows chrome ──────────────────────────────
  System::Call "user32::GetWindowLong(i $HWNDPARENT, i -16) i .r0"
  IntOp $1 $0 & 0x3F000000
  IntOp $1 $1 | 0x80000000
  System::Call "user32::SetWindowLong(i $HWNDPARENT, i -16, i r1)"
  System::Call "user32::GetWindowLong(i $HWNDPARENT, i -20) i .r2"
  IntOp $3 $2 & 0xFFFFFEFF
  System::Call "user32::SetWindowLong(i $HWNDPARENT, i -20, i r3)"

  ; ── Hide branding bar (Nullsoft Install System text) ─────────────
  ; The branding text control has ID 1028
  GetDlgItem $0 $HWNDPARENT 1028
  ShowWindow $0 0
  ; Also hide the outer branding panel
  GetDlgItem $0 $HWNDPARENT 1037
  ShowWindow $0 0

  ; ── Resize to 600x420 and centre ─────────────────────────────────
  System::Call "user32::GetSystemMetrics(i 0) i .r4"
  System::Call "user32::GetSystemMetrics(i 1) i .r5"
  IntOp $6 $4 - 600
  IntOp $6 $6 / 2
  IntOp $7 $5 - 420
  IntOp $7 $7 / 2
  System::Call "user32::SetWindowPos(i $HWNDPARENT, i 0, i r6, i r7, i 600, i 420, i 0x24)"
  System::Call "user32::SetWindowText(i $HWNDPARENT, t 'HexBrief Setup')"
FunctionEnd

Function un.onInit
  SetRegView 64
FunctionEnd
