using System;
using Microsoft.AspNet.Identity;
using System.Collections.Generic;
using System.Linq;
using brainFuck.Models;
using System.Web;
using System.Web.Mvc;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Net;
using brainFuck.Controllers;
using Microsoft.AspNet.Identity;


namespace brainFuck.Controllers
{

    [Authorize]
    public class HomeController : Controller
    {
        private FileDbContext db;
        public HomeController()
        {
            db = new FileDbContext();
        }
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Create(File document)
        {
            string currentUserId = User.Identity.GetUserId();
            document.UserId = currentUserId;
            db.Files.Add(document);
            db.SaveChanges();
            ViewData["Message"] = "success";
            return Json(document);
            //return View(document);
        }

        [HttpPost]
        public ActionResult Delete(int Id)
        {      
            string currentUserId = User.Identity.GetUserId();
            var doc = db.Files.Find(Id);
            db.Files.Remove(doc);
            db.SaveChanges();
            //return Json(document);
            IEnumerable<File> documents = db.Files.Where(x => x.UserId == currentUserId).ToList();
            return Json(documents, JsonRequestBehavior.AllowGet);

        }
	

        [HttpPost]
        public ActionResult Rename(int Id, string Name)
        {
            string currentUserId = User.Identity.GetUserId();
            File file = new File();
            var doc = db.Files.Find(Id);
            doc.Name = Name;
            db.Entry(doc).State = EntityState.Modified;
            db.SaveChanges();
            return Json(doc);
        }

        [HttpGet]
        public ActionResult Get()
        {
            string currentUserId = User.Identity.GetUserId();
            IEnumerable<File> documents = db.Files.Where(x => x.UserId == currentUserId).ToList();
            return Json(documents, JsonRequestBehavior.AllowGet);
        }

    }
}
