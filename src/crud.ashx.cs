using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Web;

namespace HanZiHtmlEditGrid
{
	/// <summary>
	/// HanZiHtmlEditGrid curd demo 
	/// </summary>
	public class crud : IHttpHandler
	{
		SqlConnection con = new SqlConnection(System.Configuration.ConfigurationManager.ConnectionStrings["connectstring"].ConnectionString);
		public void ProcessRequest(HttpContext context)
		{
			string action = HttpContext.Current.Request.QueryString["action"];
			string tablename = HttpContext.Current.Request.QueryString["tablename"];
			if (string.IsNullOrWhiteSpace(tablename))
			{
				tablename = HttpContext.Current.Request.Form["tablename"];
			}
			string newvalue = HttpContext.Current.Request.Form["newvalue"];
			string colname = HttpContext.Current.Request.Form["colname"];
			string wherestr = HttpContext.Current.Request.Form["wherestr"];
			switch (action)
			{
				case "load":
					loadData(context, tablename, wherestr);
					break;
				case "add":
					addData(context, tablename, wherestr);
					break;
				case "delete":
					delteData(context, tablename, wherestr);
					break;
				case "update":
					updateData(context, tablename, colname, newvalue, wherestr);
					break;
			}


		}

		private void updateData(HttpContext context, string tablename, string colname, string newvalue, string wherestr)
		{
			if (con.State != System.Data.ConnectionState.Open) con.Open();
			string sql = " update " + tablename + " set " + colname + "= '" + newvalue + "'";
			if (!string.IsNullOrWhiteSpace(wherestr)) // warning :primarykey is null  !!!
			{
				sql += " where " + wherestr;
			}
			SqlCommand cmd = new SqlCommand(sql, con);
			int count = cmd.ExecuteNonQuery();
			if (count > 0)
			{
				context.Response.Write("ok");
			}

		}

		private void delteData(HttpContext context, string tablename, string wherestr)
		{
			if (con.State != System.Data.ConnectionState.Open) con.Open();
			string sql = " delete from  " + tablename + " ";
			if (!string.IsNullOrWhiteSpace(wherestr))
			{
				sql += " where " + wherestr;				
			}
			SqlCommand cmd = new SqlCommand(sql, con);
			int count = cmd.ExecuteNonQuery();
			if (count > 0)
			{
				context.Response.Write("ok");
			}
		}

		private void addData(HttpContext context, string tablename, string wherestr)
		{
			string customerid = HttpContext.Current.Request.Form["customerid"];
			string companyname = HttpContext.Current.Request.Form["companyname"];
			string contactname = HttpContext.Current.Request.Form["contactname"];
			string address = HttpContext.Current.Request.Form["address"];
			if (con.State != System.Data.ConnectionState.Open) con.Open();
			string guid = System.Guid.NewGuid().ToString();
			string sql = " insert into " + tablename + " (customerid,companyname,contactname,address) values('" + customerid + "','" + companyname + "','" + contactname + "','" + address + "')"; //warning: sql inject 
			if (!string.IsNullOrWhiteSpace(wherestr))
			{
				sql += " where " + wherestr;
			}
			SqlCommand cmd = new SqlCommand(sql, con);
			int count = cmd.ExecuteNonQuery();
			if (count > 0)
			{
				context.Response.Write("ok");
			}
		}

		private void loadData(HttpContext context, string tablename, string wherestr)
		{
			if (con.State != System.Data.ConnectionState.Open) con.Open();
			string sql = "select top 300 * from " + tablename;
			if (!string.IsNullOrWhiteSpace(wherestr))
			{
				sql += " where " + wherestr;
			}
			sql += " order by CustomerID desc ";
			SqlDataAdapter sda = new SqlDataAdapter(sql, con);
			DataTable dt = new DataTable();
			sda.Fill(dt);

			string json = ConvertJsonFromDt(dt);
			context.Response.Write(json);
		}


		private string ConvertJsonFromDt(DataTable dt)
		{
			string primarykey = "CustomerID";
			StringBuilder sb = new StringBuilder("{\"metadata\":[");
			for (int i = 0; i < dt.Columns.Count; i++)
			{
				string colname = dt.Columns[i].ColumnName;
				string coluiname = GetColUIName(dt.TableName, colname);
				bool isprimarykey = GetPrimaryKey(dt.TableName, colname);
				if (isprimarykey) primarykey = dt.Columns[i].ColumnName;
				sb.Append("{\"name\":\"" + colname + "\",\"label\":\"" + coluiname + "\",\"datatype\":\"string\",\"bar\":true,\"hidden\":false,\"editable\":" + (!isprimarykey).ToString().ToLower() + ",\"values\":null},");

			}
			sb.Append("{\"name\":\"action\",\"label\":\"Action\",\"datatype\":\"html\",\"bar\":true,\"hidden\":false,\"editable\":false,\"values\":null}");

			sb.Append("],");
			sb.Append("\"data\":[");

			foreach (DataRow dr in dt.Rows)
			{
				sb.Append("{\"" + primarykey + "\":\"" + dr[primarykey].ToString() + "\",");		//主键			
				sb.Append("\"values\":[\"" + dr[primarykey].ToString() + "\"");
				for (int i = 0; i < dt.Columns.Count; i++)
				{
					if (dt.Columns[i].ColumnName == primarykey) continue;
					sb.Append(",\"" + dr[dt.Columns[i].ColumnName].ToString() + "\"");

				}
				sb.Append(",\"" + dr[primarykey].ToString() + "\"]},");	//主键	
			}
			sb.Remove(sb.Length - 1, 1);
			sb.Append("]}");
			return sb.ToString();
		}
		/// <summary>
		/// 分层时可以在dal层处理
		/// </summary>
		/// <param name="p1"></param>
		/// <param name="colname"></param>
		/// <returns></returns>
		private bool GetPrimaryKey(string p1, string colname)
		{
			if (colname == "CustomerID") return true; return false;
		}

		private string GetColUIName(string p1, string colname)
		{
			return colname.ToUpper();
		}
		
		
		public bool IsReusable
		{
			get
			{
				return false;
			}
		}
	}
}