; HexBrief Full Custom NSIS Installer
; All pages custom via nsDialogs
; Dialog: 315u x 193u. Sidebar: 109u wide. Content: 206u wide (starts at 109u).
; Verified coordinates from MUI2 Welcome.nsh source.
; No LogicLib. No WindowSize. No duplicate functions.

Unicode true

!include "nsDialogs.nsh"

ShowInstDetails nevershow
ShowUninstDetails nevershow
Caption "HexBrief Setup"
InstallDir "$LOCALAPPDATA\Programs\HexBrief"
BrandingText "HexBrief ${VERSION}"

; ── Variables ────────────────────────────────────────────────────
Var hDlg
Var hProgress
Var hLog
Var hLaunchCheck
Var hDesktopCheck
Var hStartCheck
Var hDirReq
Var InstDir_
Var DoDesktop
Var DoStart

; ── Pages ────────────────────────────────────────────────────────
Page custom pg_Welcome_Show pg_Welcome_Leave
Page custom pg_Options_Show pg_Options_Leave
Page custom pg_Install_Show pg_Install_Leave
Page instfiles "" "" pg_Instfiles_Pre
Page custom pg_Finish_Show

UninstPage custom un.pg_Confirm_Show un.pg_Confirm_Leave
UninstPage instfiles "" "" un.pg_Instfiles_Pre
UninstPage custom un.pg_Done_Show

; ================================================================
; SHARED SIDEBAR MACRO
; Draws: sidebar BMP, red top bar, red right edge, dark content bg
; ================================================================
!macro HB_Sidebar
  ${NSD_CreateBitmap} 0u 0u 109u 193u ""
  Pop $0
  ${NSD_SetImage} $0 "${MUI_WELCOMEFINISHPAGE_BITMAP}" $1

  ${NSD_CreateLabel} 0u 0u 109u 3u ""
  Pop $0
  SetCtlColors $0 "" "0xe8412a"

  ${NSD_CreateLabel} 107u 0u 2u 193u ""
  Pop $0
  SetCtlColors $0 "" "0xe8412a"

  ${NSD_CreateLabel} 109u 0u 206u 193u ""
  Pop $0
  SetCtlColors $0 "" "0x0a0f1e"
!macroend

; ================================================================
; SHARED HEADER MACRO
; accentcol: "red" or "green"
; ================================================================
!macro HB_Header title subtitle accentcol
  ${NSD_CreateLabel} 109u 0u 206u 38u ""
  Pop $0
  !if "${accentcol}" == "green"
    SetCtlColors $0 "" "0x0d1f0d"
  !else
    SetCtlColors $0 "" "0x0f1629"
  !endif

  ${NSD_CreateLabel} 120u 8u 185u 16u "${title}"
  Pop $0
  !if "${accentcol}" == "green"
    SetCtlColors $0 "0xa5d6a7" "0x0d1f0d"
  !else
    SetCtlColors $0 "0xf0f2f8" "0x0f1629"
  !endif
  CreateFont $R9 "Segoe UI" 10 700
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 120u 26u 185u 10u "${subtitle}"
  Pop $0
  !if "${accentcol}" == "green"
    SetCtlColors $0 "0x4a7a4a" "0x0d1f0d"
  !else
    SetCtlColors $0 "0x6070a8" "0x0f1629"
  !endif
  CreateFont $R9 "Courier New" 7 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 109u 37u 206u 2u ""
  Pop $0
  !if "${accentcol}" == "green"
    SetCtlColors $0 "" "0x4caf50"
  !else
    SetCtlColors $0 "" "0xe8412a"
  !endif
!macroend

; ================================================================
; PAGE 1 — WELCOME
; ================================================================
Function pg_Welcome_Show
  nsDialogs::Create 1044
  Pop $hDlg
  SetCtlColors $hDlg "" "0x0a0f1e"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Welcome to HexBrief" "Personal morning dashboard installer" "red"

  ${NSD_CreateLabel} 120u 46u 185u 12u "HexBrief is your personal morning dashboard."
  Pop $0
  SetCtlColors $0 "0xf0f2f8" "0x0a0f1e"
  CreateFont $R9 "Segoe UI" 9 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 120u 62u 185u 36u "Weather, tasks, headlines and calendar in one place. No accounts. No tracking. No subscriptions."
  Pop $0
  SetCtlColors $0 "0x9aa5c8" "0x0a0f1e"
  CreateFont $R9 "Segoe UI" 8 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 120u 106u 185u 10u "Click Next to continue."
  Pop $0
  SetCtlColors $0 "0x6070a8" "0x0a0f1e"
  CreateFont $R9 "Segoe UI" 8 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  nsDialogs::Show
FunctionEnd

Function pg_Welcome_Leave
FunctionEnd

; ================================================================
; PAGE 2 — OPTIONS
; ================================================================
Function pg_Options_Show
  nsDialogs::Create 1044
  Pop $hDlg
  SetCtlColors $hDlg "" "0x0a0f1e"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Install location" "Choose where to install HexBrief" "red"

  ${NSD_CreateLabel} 120u 46u 100u 10u "Destination folder:"
  Pop $0
  SetCtlColors $0 "0x6070a8" "0x0a0f1e"
  CreateFont $R9 "Courier New" 7 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateDirRequest} 120u 58u 185u 14u "$InstDir_"
  Pop $hDirReq

  ${NSD_CreateCheckbox} 122u 80u 180u 12u "Create desktop shortcut"
  Pop $hDesktopCheck
  SetCtlColors $hDesktopCheck "0xf0f2f8" "0x0a0f1e"
  ${NSD_SetState} $hDesktopCheck ${BST_CHECKED}

  ${NSD_CreateCheckbox} 122u 96u 180u 12u "Add to Start Menu"
  Pop $hStartCheck
  SetCtlColors $hStartCheck "0xf0f2f8" "0x0a0f1e"
  ${NSD_SetState} $hStartCheck ${BST_CHECKED}

  nsDialogs::Show
FunctionEnd

Function pg_Options_Leave
  ${NSD_GetText} $hDirReq $InstDir_
  StrCpy $INSTDIR "$InstDir_"
  ${NSD_GetState} $hDesktopCheck $DoDesktop
  ${NSD_GetState} $hStartCheck $DoStart
FunctionEnd

; ================================================================
; PAGE 3 — INSTALL
; ================================================================
Function pg_Install_Show
  nsDialogs::Create 1044
  Pop $hDlg
  SetCtlColors $hDlg "" "0x0a0f1e"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Installing..." "Please wait while files are extracted" "red"

  ${NSD_CreateLabel} 120u 46u 185u 10u "Extracting application files:"
  Pop $0
  SetCtlColors $0 "0x6070a8" "0x0a0f1e"
  CreateFont $R9 "Courier New" 7 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateProgressBar} 120u 58u 185u 10u ""
  Pop $hProgress
  SendMessage $hProgress ${PBM_SETRANGE} 0 0x640000
  SendMessage $hProgress ${PBM_SETPOS} 0 0

  ${NSD_CreateLabel} 120u 72u 185u 10u ""
  Pop $hLog
  SetCtlColors $hLog "0x6070a8" "0x0a0f1e"
  CreateFont $R9 "Courier New" 7 400
  SendMessage $hLog ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 120u 86u 185u 50u ""
  Pop $0
  SetCtlColors $0 "" "0x050a14"

  nsDialogs::Show

  ; ── Actual install ───────────────────────────────────────────
  SetDetailsPrint none
  SetOutPath "$INSTDIR"
  InitPluginsDir

  SendMessage $hLog ${WM_SETTEXT} 0 "STR:> Extracting files..."
  SendMessage $hProgress ${PBM_SETPOS} 10 0

  !ifdef APP_32
    !ifdef APP_64
      System::Call "kernel32::IsWow64Process(i -1, *i .r0)"
      StrCmp $0 "1" hb_use64 hb_use32
      hb_use64:
        File /oname=$PLUGINSDIR\app.7z "${APP_64}"
        Goto hb_extract
      hb_use32:
        File /oname=$PLUGINSDIR\app.7z "${APP_32}"
      hb_extract:
    !else
      File /oname=$PLUGINSDIR\app.7z "${APP_32}"
    !endif
  !else
    File /oname=$PLUGINSDIR\app.7z "${APP_64}"
  !endif

  Nsis7z::Extract "$PLUGINSDIR\app.7z"
  SendMessage $hProgress ${PBM_SETPOS} 60 0
  SendMessage $hLog ${WM_SETTEXT} 0 "STR:> Creating shortcuts..."

  WriteUninstaller "$INSTDIR\Uninstall HexBrief.exe"

  IntCmp $DoDesktop ${BST_CHECKED} 0 hb_skip_desk hb_skip_desk
    CreateShortcut "$DESKTOP\HexBrief.lnk" "$INSTDIR\HexBrief.exe"
  hb_skip_desk:

  IntCmp $DoStart ${BST_CHECKED} 0 hb_skip_start hb_skip_start
    CreateDirectory "$SMPROGRAMS\HexBrief"
    CreateShortcut "$SMPROGRAMS\HexBrief\HexBrief.lnk" "$INSTDIR\HexBrief.exe"
    CreateShortcut "$SMPROGRAMS\HexBrief\Uninstall.lnk" "$INSTDIR\Uninstall HexBrief.exe"
  hb_skip_start:

  SendMessage $hLog ${WM_SETTEXT} 0 "STR:> Writing registry..."
  SendMessage $hProgress ${PBM_SETPOS} 85 0

  WriteRegStr HKCU "Software\HexBrief" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\HexBrief" "Version" "${VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "DisplayName" "HexBrief"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "UninstallString" '"$INSTDIR\Uninstall HexBrief.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "Publisher" "HexBrief"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "DisplayIcon" "$INSTDIR\HexBrief.exe"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief" "NoRepair" 1

  SendMessage $hProgress ${PBM_SETPOS} 100 0
  SendMessage $hLog ${WM_SETTEXT} 0 "STR:> Done."
FunctionEnd

Function pg_Install_Leave
FunctionEnd

Function pg_Instfiles_Pre
  Abort
FunctionEnd

; ================================================================
; PAGE 4 — FINISH
; ================================================================
Function pg_Finish_Show
  nsDialogs::Create 1044
  Pop $hDlg
  SetCtlColors $hDlg "" "0x0a0f1e"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Installation complete" "HexBrief ${VERSION} is ready" "green"

  ${NSD_CreateLabel} 120u 46u 185u 12u "Installed successfully."
  Pop $0
  SetCtlColors $0 "0xf0f2f8" "0x0a0f1e"
  CreateFont $R9 "Segoe UI" 9 500
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 120u 62u 185u 24u "Open it each morning for your daily brief."
  Pop $0
  SetCtlColors $0 "0x9aa5c8" "0x0a0f1e"
  CreateFont $R9 "Segoe UI" 8 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateCheckbox} 122u 94u 180u 12u "Launch HexBrief now"
  Pop $hLaunchCheck
  SetCtlColors $hLaunchCheck "0xf0f2f8" "0x0a0f1e"
  ${NSD_SetState} $hLaunchCheck ${BST_CHECKED}

  nsDialogs::Show

  ${NSD_GetState} $hLaunchCheck $0
  IntCmp $0 ${BST_CHECKED} 0 hb_skip_launch hb_skip_launch
    Exec '"$INSTDIR\HexBrief.exe"'
  hb_skip_launch:
FunctionEnd

; ================================================================
; UNINSTALLER — CONFIRM
; ================================================================
Function un.pg_Confirm_Show
  nsDialogs::Create 1044
  Pop $hDlg
  SetCtlColors $hDlg "" "0x0a0f1e"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Uninstall HexBrief" "Remove HexBrief from your computer" "red"

  ${NSD_CreateLabel} 120u 46u 185u 32u "This will remove HexBrief and all its files, including your saved settings, tasks and preferences."
  Pop $0
  SetCtlColors $0 "0x9aa5c8" "0x0a0f1e"
  CreateFont $R9 "Segoe UI" 8 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 120u 84u 185u 10u "Click Uninstall to continue."
  Pop $0
  SetCtlColors $0 "0x6070a8" "0x0a0f1e"

  nsDialogs::Show
FunctionEnd

Function un.pg_Confirm_Leave
FunctionEnd

Function un.pg_Instfiles_Pre
  Abort
FunctionEnd

; ================================================================
; UNINSTALLER — PROGRESS + DONE
; ================================================================
Function un.pg_Done_Show
  nsDialogs::Create 1044
  Pop $hDlg
  SetCtlColors $hDlg "" "0x0a0f1e"

  !insertmacro HB_Sidebar

  ; Run the uninstall during this page show
  ${NSD_CreateLabel} 109u 0u 206u 38u ""
  Pop $0
  SetCtlColors $0 "" "0x0d1f0d"

  ${NSD_CreateLabel} 109u 37u 206u 2u ""
  Pop $0
  SetCtlColors $0 "" "0x4caf50"

  ${NSD_CreateLabel} 120u 8u 185u 16u "Uninstall complete"
  Pop $0
  SetCtlColors $0 "0xa5d6a7" "0x0d1f0d"
  CreateFont $R9 "Segoe UI" 10 700
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 120u 26u 185u 10u "HexBrief has been removed"
  Pop $0
  SetCtlColors $0 "0x4a7a4a" "0x0d1f0d"
  CreateFont $R9 "Courier New" 7 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 109u 37u 206u 2u ""
  Pop $0
  SetCtlColors $0 "" "0x4caf50"

  ${NSD_CreateLabel} 120u 46u 185u 12u "HexBrief has been removed from your computer."
  Pop $0
  SetCtlColors $0 "0xf0f2f8" "0x0a0f1e"
  CreateFont $R9 "Segoe UI" 9 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  nsDialogs::Show

  ; Do the actual uninstall work
  nsProcess::_FindProcess "HexBrief.exe"
  Pop $0
  IntCmp $0 0 0 hb_un_skip_kill hb_un_skip_kill
    nsProcess::_KillProcess "HexBrief.exe"
    Sleep 800
  hb_un_skip_kill:

  RMDir /r "$INSTDIR"
  RMDir /r "$APPDATA\HexBrief"
  RMDir /r "$LOCALAPPDATA\HexBrief"
  Delete "$DESKTOP\HexBrief.lnk"
  Delete "$QUICKLAUNCH\HexBrief.lnk"
  Delete "$SMPROGRAMS\HexBrief\HexBrief.lnk"
  Delete "$SMPROGRAMS\HexBrief\Uninstall.lnk"
  RMDir "$SMPROGRAMS\HexBrief"
  Delete "$SMSTARTUP\HexBrief.lnk"
  DeleteRegKey HKCU "Software\HexBrief"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\HexBrief"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "HexBrief"
FunctionEnd

; ================================================================
; SECTIONS
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
  System::Call "kernel32::IsWow64Process(i -1, *i .r0)"
  StrCmp $0 "1" 0 hb_init_done
    SetRegView 64
  hb_init_done:
  !ifdef BUILD_UNINSTALLER
    WriteUninstaller "${UNINSTALLER_OUT_FILE}"
    Quit
  !endif
FunctionEnd

Function un.onInit
  SetRegView 64
FunctionEnd
