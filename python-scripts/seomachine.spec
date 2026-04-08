# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec for SEO Machine Python scripts.

Per D-01: PyInstaller single-file configuration for Python script bundling.
Build command: pyinstaller seomachine.spec

This spec bundles all SEO research scripts into executable form for
inclusion in the Tauri application bundle.
"""

import os
import sys
from PyInstaller.utils.hooks import collect_all, collect_submodules

block_cipher = None

# =============================================================================
# Shared hidden imports (libraries used across all scripts)
# =============================================================================
hidden_imports = [
    'dotenv',
    'dotenv.main',
    'dotenv.cli',
    'dotenv.load_dotenv',
    'json',
    'os',
    'sys',
    'datetime',
    'typing',
    'collections',
    'urllib.request',
    'urllib.error',
    'urllib.parse',
]

# Collect submodules for packages that may have dynamic imports
try:
    hidden_imports += collect_submodules('dotenv')
except Exception:
    pass

# =============================================================================
# Research script entry points
# =============================================================================
scripts = [
    ('research_competitor_gaps.py', 'seomachine_competitor_gaps'),
    ('research_performance_matrix.py', 'seomachine_performance_matrix'),
    ('research_priorities_comprehensive.py', 'seomachine_priorities'),
    ('research_quick_wins.py', 'seomachine_quick_wins'),
    ('research_serp_analysis.py', 'seomachine_serp'),
    ('research_topic_clusters.py', 'seomachine_topics'),
    ('research_trending.py', 'seomachine_trending'),
    ('seo_baseline_analysis.py', 'seomachine_baseline'),
    ('seo_bofu_rankings.py', 'seomachine_bofu'),
    ('seo_competitor_analysis.py', 'seomachine_competitor'),
    ('test_dataforseo.py', 'seomachine_test_api'),
]

# =============================================================================
# Build configuration
# =============================================================================
appname = 'seomachine'
distpath = 'dist'
workpath = 'build'
specpath = os.path.dirname(os.path.abspath(SPEC))

# =============================================================================
# Analysis for aopc (all scripts share same hidden imports)
# =============================================================================
a = Analysis(
    ['research_competitor_gaps.py'],  # Primary script for analysis
    pathex=[specpath],
    binaries=[],
    datas=[
        ('config', 'config'),
    ],
    hiddenimports=hidden_imports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'tkinter',
        'matplotlib',
        'numpy',  # Exclude heavy deps not needed
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

# Create merged collection for all scripts
# Note: Each script requires its own PyInstaller run for proper bundling
# This spec is a template - run: pyinstaller --onefile script.py for each

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

# =============================================================================
# Single file executable (primary tool)
# =============================================================================
exe_main = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='seomachine',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,  # GUI app - no console window
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

# =============================================================================
# Distributed collection (if running in tree format)
# =============================================================================
coll = COLLECT(
    exe_main,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='seomachine',
)

# =============================================================================
# Note for building individual scripts:
# ===============
# To build each script as a separate executable:
#
# for script, name in scripts:
#     os.system(f'pyinstaller --onefile --name {name} --console false {script}')
#
# Or use the multi-PYZ approach with separate executables.
# =============================================================================
