; HexBrief Full Custom NSIS Installer
; electron-builder injects: Unicode, Name, OutFile, VIProductVersion,
; BrandingText, MUI_WELCOMEFINISHPAGE_BITMAP, APP_32/APP_64, VERSION
; Do NOT redeclare any of the above.

!include "nsDialogs.nsh"

ShowInstDetails nevershow
ShowUninstDetails nevershow
Caption "HexBrief Setup"
InstallDir "$LOCALAPPDATA\Programs\HexBrief"

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
; SHARED SIDEBAR — draws sidebar BMP + dark content area
; No red borders (they were causing the split-box visual)
; ================================================================
!macro HB_Sidebar
  ; Sidebar image (164u wide, full height)
  ${NSD_CreateBitmap} 0u 0u 164u 100%u ""
  Pop $0
  ${NSD_SetImage} $0 "${MUI_WELCOMEFINISHPAGE_BITMAP}" $1

  ; Thin vertical divider between sidebar and content
  ${NSD_CreateLabel} 163u 0u 1u 100%u ""
  Pop $0
  SetCtlColors $0 "" "0x1a1f3a"

  ; Dark content area background
  ${NSD_CreateLabel} 164u 0u 336u 100%u ""
  Pop $0
  SetCtlColors $0 "" "0x080d1e"
!macroend

; ================================================================
; SHARED HEADER — title + subtitle + accent line
; accentcol: "red" or "green"
; ================================================================
!macro HB_Header title subtitle accentcol
  ; Header background strip
  ${NSD_CreateLabel} 164u 0u 336u 52u ""
  Pop $0
  !if "${accentcol}" == "green"
    SetCtlColors $0 "" "0x0d1f0d"
  !else
    SetCtlColors $0 "" "0x0f1629"
  !endif

  ; Title
  ${NSD_CreateLabel} 178u 10u 300u 18u "${title}"
  Pop $0
  !if "${accentcol}" == "green"
    SetCtlColors $0 "0xa5d6a7" "0x0d1f0d"
  !else
    SetCtlColors $0 "0xf0f2f8" "0x0f1629"
  !endif
  CreateFont $R9 "Segoe UI" 10 700
  SendMessage $0 ${WM_SETFONT} $R9 0

  ; Subtitle
  ${NSD_CreateLabel} 178u 32u 300u 12u "${subtitle}"
  Pop $0
  !if "${accentcol}" == "green"
    SetCtlColors $0 "0x4a7a4a" "0x0d1f0d"
  !else
    SetCtlColors $0 "0x6070a8" "0x0f1629"
  !endif
  CreateFont $R9 "Courier New" 7 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ; Accent line below header
  ${NSD_CreateLabel} 164u 52u 336u 2u ""
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
  nsDialogs::Create 1018
  Pop $hDlg
  SetCtlColors $hDlg "" "0x080d1e"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Welcome to HexBrief" "Personal morning dashboard installer" "red"

  ${NSD_CreateLabel} 178u 64u 300u 14u "HexBrief is your personal morning dashboard."
  Pop $0
  SetCtlColors $0 "0xf0f2f8" "0x080d1e"
  CreateFont $R9 "Segoe UI" 9 600
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 178u 82u 300u 40u "Weather, tasks, headlines and calendar in one place. No accounts. No tracking. No subscriptions."
  Pop $0
  SetCtlColors $0 "0x8a96bc" "0x080d1e"
  CreateFont $R9 "Segoe UI" 8 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 178u 132u 300u 12u "Click Next to continue."
  Pop $0
  SetCtlColors $0 "0x5060a0" "0x080d1e"
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
  nsDialogs::Create 1018
  Pop $hDlg
  SetCtlColors $hDlg "" "0x080d1e"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Install location" "Choose where to install HexBrief" "red"

  ${NSD_CreateLabel} 178u 64u 180u 12u "Destination folder:"
  Pop $0
  SetCtlColors $0 "0x5060a0" "0x080d1e"
  CreateFont $R9 "Courier New" 7 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateDirRequest} 178u 80u 290u 14u "$InstDir_"
  Pop $hDirReq

  ${NSD_CreateCheckbox} 180u 102u 280u 14u "Create desktop shortcut"
  Pop $hDesktopCheck
  SetCtlColors $hDesktopCheck "0xf0f2f8" "0x080d1e"
  ${NSD_SetState} $hDesktopCheck ${BST_CHECKED}

  ${NSD_CreateCheckbox} 180u 120u 280u 14u "Add to Start Menu"
  Pop $hStartCheck
  SetCtlColors $hStartCheck "0xf0f2f8" "0x080d1e"
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
  nsDialogs::Create 1018
  Pop $hDlg
  SetCtlColors $hDlg "" "0x080d1e"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Installing..." "Please wait while files are extracted" "red"

  ${NSD_CreateLabel} 178u 64u 300u 12u "Extracting application files:"
  Pop $0
  SetCtlColors $0 "0x5060a0" "0x080d1e"
  CreateFont $R9 "Courier New" 7 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateProgressBar} 178u 80u 290u 12u ""
  Pop $hProgress
  SendMessage $hProgress ${PBM_SETRANGE} 0 0x640000
  SendMessage $hProgress ${PBM_SETPOS} 0 0

  ${NSD_CreateLabel} 178u 96u 290u 12u ""
  Pop $hLog
  SetCtlColors $hLog "0x5060a0" "0x080d1e"
  CreateFont $R9 "Courier New" 7 400
  SendMessage $hLog ${WM_SETFONT} $R9 0

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
  nsDialogs::Create 1018
  Pop $hDlg
  SetCtlColors $hDlg "" "0x080d1e"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Installation complete" "HexBrief ${VERSION} is ready" "green"

  ${NSD_CreateLabel} 178u 64u 300u 14u "Installed successfully."
  Pop $0
  SetCtlColors $0 "0xf0f2f8" "0x080d1e"
  CreateFont $R9 "Segoe UI" 9 600
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 178u 82u 300u 28u "Open it each morning for your daily brief."
  Pop $0
  SetCtlColors $0 "0x8a96bc" "0x080d1e"
  CreateFont $R9 "Segoe UI" 8 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateCheckbox} 180u 118u 280u 14u "Launch HexBrief now"
  Pop $hLaunchCheck
  SetCtlColors $hLaunchCheck "0xf0f2f8" "0x080d1e"
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
  nsDialogs::Create 1018
  Pop $hDlg
  SetCtlColors $hDlg "" "0x080d1e"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Uninstall HexBrief" "Remove HexBrief from your computer" "red"

  ${NSD_CreateLabel} 178u 64u 300u 40u "This will remove HexBrief and all its files, including your saved settings, tasks and preferences."
  Pop $0
  SetCtlColors $0 "0x8a96bc" "0x080d1e"
  CreateFont $R9 "Segoe UI" 8 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  ${NSD_CreateLabel} 178u 110u 300u 12u "Click Uninstall to continue."
  Pop $0
  SetCtlColors $0 "0x5060a0" "0x080d1e"
  CreateFont $R9 "Segoe UI" 8 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  nsDialogs::Show
FunctionEnd

Function un.pg_Confirm_Leave
FunctionEnd

Function un.pg_Instfiles_Pre
  Abort
FunctionEnd

; ================================================================
; UNINSTALLER — DONE
; ================================================================
Function un.pg_Done_Show
  nsDialogs::Create 1018
  Pop $hDlg
  SetCtlColors $hDlg "" "0x080d1e"

  !insertmacro HB_Sidebar
  !insertmacro HB_Header "Uninstall complete" "HexBrief has been removed" "green"

  ${NSD_CreateLabel} 178u 64u 300u 14u "HexBrief has been removed from your computer."
  Pop $0
  SetCtlColors $0 "0xf0f2f8" "0x080d1e"
  CreateFont $R9 "Segoe UI" 9 400
  SendMessage $0 ${WM_SETFONT} $R9 0

  nsDialogs::Show

  ; Do the actual uninstall work after page shows
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
Function .onGUIInit
  ; Strip title bar — keep only WS_POPUP | WS_VISIBLE
  System::Call "user32::GetWindowLong(i $HWNDPARENT, i -16) i .r0"
  IntOp $1 $0 & 0x10000000
  IntOp $1 $1 | 0x80000000
  System::Call "user32::SetWindowLong(i $HWNDPARENT, i -16, i r1)"

  ; Remove WS_EX_WINDOWEDGE and WS_EX_CLIENTEDGE (causes red border)
  System::Call "user32::GetWindowLong(i $HWNDPARENT, i -20) i .r2"
  IntOp $3 $2 & 0xFFFFFEFE
  System::Call "user32::SetWindowLong(i $HWNDPARENT, i -20, i r3)"

  ; Hide NSIS branding bar
  GetDlgItem $4 $HWNDPARENT 1028
  ShowWindow $4 0
  GetDlgItem $4 $HWNDPARENT 1037
  ShowWindow $4 0

  ; Apply frame change
  System::Call "user32::SetWindowPos(i $HWNDPARENT, i 0, i 0, i 0, i 0, i 0, i 0x27)"
FunctionEnd

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
