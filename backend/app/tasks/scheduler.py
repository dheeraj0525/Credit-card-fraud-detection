import asyncio
import logging
from datetime import datetime

logger = logging.getLogger("fraudsense.scheduler")

class BackgroundScheduler:
    def __init__(self):
        self.is_running = False
        self._task = None

    def start(self):
        if self.is_running:
            return
        self.is_running = True
        self._task = asyncio.create_task(self._loop())
        logger.info("Background job scheduler initialized.")

    async def stop(self):
        self.is_running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("Background job scheduler stopped.")

    async def _loop(self):
        # Initial wait so server starts up cleanly
        await asyncio.sleep(5)
        while self.is_running:
            try:
                await self.run_daily_report_job()
                await self.run_retraining_check_job()
                await self.run_cleanup_job()
            except Exception as e:
                logger.error(f"Error in scheduler job execution: {str(e)}")
            # Repeat run every 120 seconds in local dev
            await asyncio.sleep(120)

    async def run_daily_report_job(self):
        logger.info("[Scheduler Task] Generating daily fraud summary report cache...")
        # Simulates generating a summary file
        await asyncio.sleep(0.1)

    async def run_retraining_check_job(self):
        logger.info("[Scheduler Task] Inspecting database for ML model drift indicators...")
        # Simulates evaluating data drift trigger checks
        await asyncio.sleep(0.1)

    async def run_cleanup_job(self):
        logger.info("[Scheduler Task] Cleaning up expired verification sessions and temporary metrics cache...")
        await asyncio.sleep(0.1)

scheduler = BackgroundScheduler()
