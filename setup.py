from setuptools import setup, find_packages

setup(
    name="aider-bridge",
    version="0.1.0",
    description="Browser extension + API server for Claude/Perplexity integration with Aider",
    author="Your Name",
    author_email="your.email@example.com",
    url="https://github.com/yourusername/aider-bridge",
    license="MIT",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "aider-ai>=0.25.0",
        "flask>=2.3.0",
        "flask-cors>=4.0.0",
        "pyyaml>=6.0",
    ],
    entry_points={
        "console_scripts": [
            "aider-bridge-start=aider_bridge.cli:start_server",
        ],
    },
    python_requires=">=3.9",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
    ],
)
